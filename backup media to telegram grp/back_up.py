import os
import shutil
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from typing import Optional
from datetime import datetime

from config import Config
from utils.logger import telegram_logger as logger
from utils.helpers import is_valid_twitter_url
from exceptions import TwitterBotError, FileTransferError


class TelegramBot:
    def __init__(self):
        self.config = Config
        self.config.setup_directories()
        self.app = Application.builder().token(self.config.TELEGRAM_BOT_TOKEN).build()
        # Define supported media formats
        self.supported_formats = {
            'images': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
            'videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm'],
            'audio': ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
            'documents': ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar']
        }
        self.setup_handlers()

    def setup_handlers(self):
        """Setup message and command handlers"""
        self.app.add_handler(CommandHandler("start", self.start))
        self.app.add_handler(CommandHandler("backup", self.backup))
        self.app.add_handler(CommandHandler("retry_failed", self.retry_failed))
        self.app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))

    def get_all_files(self, directory):
        """Recursively get all files from directory and its subdirectories"""
        all_files = []
        try:
            for root, dirs, files in os.walk(directory):
                for file in files:
                    file_path = os.path.join(root, file)
                    file_ext = os.path.splitext(file)[1].lower()
                    # Check if file extension is in any of the supported formats
                    if any(file_ext in formats for formats in self.supported_formats.values()):
                        # Get relative path from base directory
                        rel_path = os.path.relpath(root, directory)
                        all_files.append({
                            'path': file_path,
                            'name': file,
                            'relative_dir': rel_path if rel_path != '.' else ''
                        })
            return all_files
        except Exception as e:
            logger.error(f"Error scanning directory {directory}: {str(e)}")
            return []

    def handle_failed_transfer(self, file_info: dict, error: Exception) -> bool:
        """Handle failed file transfer by moving to failed directory with structure preservation"""
        try:
            # Create the same directory structure in failed transfers
            failed_dir = os.path.join(self.config.FAILED_TRANSFER_DIR, file_info['relative_dir'])
            os.makedirs(failed_dir, exist_ok=True)
            
            # Move the file to failed transfers directory
            failed_path = os.path.join(failed_dir, file_info['name'])
            shutil.move(file_info['path'], failed_path)
            
            # Log detailed error information
            error_info = {
                'file': file_info['name'],
                'original_path': file_info['path'],
                'failed_path': failed_path,
                'error': str(error),
                'timestamp': datetime.now().isoformat()
            }
            
            # Log error details
            logger.error(f"Transfer failed for {file_info['name']}: {str(error)}")
            return True
        except Exception as e:
            logger.error(f"Error handling failed transfer for {file_info['name']}: {str(e)}")
            return False

    async def retry_failed(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handler for the /retry_failed command - attempts to resend failed transfers"""
        try:
            # Send initial status message
            status_message = await update.message.reply_text("Checking for failed transfers...")
            
            # Get all files from failed transfers directory
            failed_files = self.get_all_files(self.config.FAILED_TRANSFER_DIR)
            
            if not failed_files:
                await status_message.edit_text("No failed transfers found to retry.")
                return
            
            await status_message.edit_text(f"Found {len(failed_files)} failed transfers. Starting retry...")
            
            # Initialize counters
            successful = 0
            still_failed = 0
            
            # Process each failed file
            for file_info in failed_files:
                try:
                    with open(file_info['path'], 'rb') as file:
                        caption = f"Retry - From folder: {file_info['relative_dir']}" if file_info['relative_dir'] else "Retry"
                        
                        await context.bot.send_document(
                            chat_id=self.config.TELEGRAM_GROUP_CHAT_ID,
                            document=file,
                            filename=file_info['name'],
                            caption=caption
                        )
                    successful += 1
                    os.remove(file_info['path'])  # Remove after successful transfer
                    
                    # Remove empty directories in failed transfers
                    failed_dir = os.path.dirname(file_info['path'])
                    if not os.listdir(failed_dir):
                        os.rmdir(failed_dir)
                        
                except Exception as e:
                    still_failed += 1
                    logger.error(f"Retry failed for {file_info['name']}: {str(e)}")
            
            # Send final status
            await status_message.edit_text(
                f"Retry completed!\n"
                f"Successfully resent: {successful}\n"
                f"Still failed: {still_failed}"
            )
            
        except Exception as e:
            logger.error(f"Error in retry_failed command: {str(e)}")
            await self._handle_error(update, "Retry process failed")

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handler for the /start command"""
        user_chat_id = update.effective_chat.id
        user_name = update.effective_user.username or "Unknown user"

        try:
            # Send welcome message to user
            await update.message.reply_text(
                "Welcome! I'm a backup bot that can help you transfer media files to the group chat. Use /backup to start the process!"
            )

            # Send notification to admin
            admin_message = f"Bot initialized by user: {user_name} (Chat ID: {user_chat_id})"
            await context.bot.send_message(
                chat_id=self.config.TELEGRAM_ADMIN_CHAT_ID,
                text=admin_message
            )
            logger.info(f"New user started bot: {user_name}")
        except Exception as e:
            logger.error(f"Error in start command: {str(e)}")
            await self._handle_error(update, "Failed to initialize bot")

    async def backup(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handler for the /backup command"""
        try:
            # Send initial status message
            status_message = await update.message.reply_text("Starting backup process...")
            
            # Check if downloads directory exists and has files
            if not os.path.exists(self.config.DOWNLOADS_DIR):
                raise FileTransferError(
                    self.config.DOWNLOADS_DIR,
                    self.config.FAILED_TRANSFER_DIR,
                    "Downloads directory not found"
                )
            
            # Get all files recursively
            files = self.get_all_files(self.config.DOWNLOADS_DIR)
            if not files:
                await status_message.edit_text("No supported media files found in downloads directory!")
                return
            
            # Initialize counters
            total_files = len(files)
            successful = 0
            failed = 0
            
            # Process each file
            for file_info in files:
                try:
                    with open(file_info['path'], 'rb') as file:
                        caption = f"From folder: {file_info['relative_dir']}" if file_info['relative_dir'] else None
                        
                        await context.bot.send_document(
                            chat_id=self.config.TELEGRAM_GROUP_CHAT_ID,
                            document=file,
                            filename=file_info['name'],
                            caption=caption
                        )
                    successful += 1
                    os.remove(file_info['path'])  # Remove file after successful transfer
                except Exception as e:
                    failed += 1
                    if self.handle_failed_transfer(file_info, e):
                        logger.info(f"File {file_info['name']} moved to failed transfers directory")
                    else:
                        logger.error(f"Could not handle failed transfer for {file_info['name']}")
            
            # Send final status to the user who initiated the backup
            message = (
                f"Backup completed!\n"
                f"Total files: {total_files}\n"
                f"Successfully sent to group: {successful}\n"
                f"Failed: {failed}\n"
            )
            
            if failed > 0:
                message += "\nUse /retry_failed to attempt resending failed transfers."
            
            message += (
                f"\n\nSupported formats:\n"
                f"📸 Images: {', '.join(self.supported_formats['images'])}\n"
                f"🎥 Videos: {', '.join(self.supported_formats['videos'])}\n"
                f"🎵 Audio: {', '.join(self.supported_formats['audio'])}\n"
                f"📄 Documents: {', '.join(self.supported_formats['documents'])}"
            )
            
            await status_message.edit_text(message)
            
        except Exception as e:
            logger.error(f"Error in backup command: {str(e)}")
            await self._handle_error(update, "Backup process failed")

    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        # Handle any other messages
        pass

def main():
    """Initialize and run the bot"""
    try:
        bot = TelegramBot()
        logger.info("Starting bot...")
        bot.app.run_polling()
    except Exception as e:
        logger.critical(f"Bot crashed: {str(e)}")
        raise

if __name__ == '__main__':
    main()