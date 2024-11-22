import { useProductionStore } from '../stores/productionStore';
import { useSalesStore } from '../stores/salesStore';

export const createBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const productionData = useProductionStore.getState().items;
  const salesData = useSalesStore.getState().items;

  const backupData = {
    timestamp,
    production: productionData,
    sales: salesData,
  };

  // Convert data to JSON string
  const backupString = JSON.stringify(backupData, null, 2);
  
  // Create Blob and download link
  const blob = new Blob([backupString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup-${timestamp}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const scheduleWeeklyBackup = () => {
  const checkAndCreateBackup = () => {
    const now = new Date();
    if (now.getDay() === 1) { // Monday is 1
      createBackup();
    }
  };

  // Check every day at 00:01
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0);
  
  const msUntilTomorrow = tomorrow.getTime() - now.getTime();
  
  // Initial delay until next check
  setTimeout(() => {
    checkAndCreateBackup();
    // Then check every 24 hours
    setInterval(checkAndCreateBackup, 24 * 60 * 60 * 1000);
  }, msUntilTomorrow);
}; 