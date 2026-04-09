import cron from 'node-cron';
import prisma from '../prisma';
import * as insightService from '../services/insight.service';
import * as analyticsService from '../services/analytics.service';
import * as emailService from '../services/email.service';

/**
 * Schedule a task to send weekly reports every Sunday at 9 AM
 */
export const scheduleWeeklyReports = () => {
  cron.schedule('0 9 * * 0', async () => {
    console.log('Running weekly report schedule...');

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
        },
      });

      for (const user of users) {
        try {
          // Fetch required data for insights
          const categoryAnalytics = await analyticsService.getCategoryAnalytics(user.id);
          const forecast = await analyticsService.getForecast(user.id);
          const healthData = await analyticsService.getFinancialHealth(user.id);

          const totalSpent = categoryAnalytics.reduce((sum, cat) => sum + cat.total, 0);

          // Generate insights
          const insights = await insightService.generateInsights({
            totalSpent,
            categories: categoryAnalytics,
            forecast: {
              forecastSpend: forecast.forecastSpend,
            },
            healthScore: healthData.healthScore,
          });

          // Send email
          await emailService.sendWeeklyReport(user.email, insights);
        } catch (error) {
          console.error(`Error generating/sending report for user ${user.email}:`, error);
        }
      }

      console.log('Weekly report schedule completed.');
    } catch (error) {
      console.error('Error running weekly report schedule:', error);
    }
  });
};
