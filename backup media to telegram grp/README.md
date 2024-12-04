# Telegram Media Backup Bot

A Python-based Telegram bot that helps you backup media files from a local directory to a Telegram group chat. The bot supports various media formats and maintains folder structures during the backup process.

## Features

- **Multi-Format Support**:
  - 📸 Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`
  - 🎥 Videos: `.mp4`, `.avi`, `.mkv`, `.mov`, `.wmv`, `.flv`, `.webm`
  - 🎵 Audio: `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`
  - 📄 Documents: `.pdf`, `.doc`, `.docx`, `.txt`, `.zip`, `.rar`

- **Advanced Directory Handling**:
  - Recursive scanning of directories
  - Preserves folder structure information
  - Handles nested folders

- **Robust Error Handling**:
  - Failed transfers are preserved with structure
  - Retry mechanism for failed transfers
  - Detailed error logging

## Prerequisites

- Python 3.7 or higher
- `python-telegram-bot` library
- A Telegram Bot Token (get from [@BotFather](https://t.me/botfather))
- A Telegram Group where the bot is an admin

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd telegram-media-backup
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:
   Create a `.env` file with the following:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id
   TELEGRAM_GROUP_CHAT_ID=your_group_chat_id
   ```

4. **Set up directories**:
   The bot will automatically create these directories if they don't exist:
   - `downloads/`: Place your media files here
   - `failed/`: Storage for failed transfers

## Usage

### Available Commands

- `/start`: Initialize the bot
- `/backup`: Start the backup process
- `/retry_failed`: Retry sending failed transfers

### How to Use

1. **Start the bot**:
   ```bash
   python back_up.py
   ```

2. **Prepare files**:
   - Place media files in the `downloads/` directory
   - You can create subdirectories to organize files

3. **Backup Process**:
   - Send `/backup` to the bot
   - The bot will:
     1. Scan all directories recursively
     2. Send supported files to the group
     3. Preserve folder structure in messages
     4. Move failed transfers to `failed/` directory

4. **Handle Failed Transfers**:
   - If any transfers fail:
     1. Files are moved to `failed/` directory
     2. Use `/retry_failed` to attempt resending
     3. Check logs for error details

## File Organization

- `back_up.py`: Main bot implementation
- `config.py`: Configuration management
- `utils/`: Helper functions and utilities
- `exceptions.py`: Custom exception definitions
- `.env`: Environment variables
- `logs/`: Log files (auto-generated)

## Error Handling

- Failed transfers maintain their folder structure in the `failed/` directory
- Detailed error logs are generated
- The retry mechanism preserves original file metadata
- Empty directories are automatically cleaned up after successful retries

## Logging

The bot maintains detailed logs including:
- Transfer attempts
- Success/failure status
- Error details with timestamps
- Directory scanning results

## Security Notes

- Keep your `.env` file secure and never commit it
- Bot token should be kept private
- Admin chat ID is used for notifications
- Group chat ID is used for file destinations

## Contributing

Feel free to:
- Report issues
- Suggest features
- Submit pull requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.
