import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';
import * as insightService from '../services/insight.service';

/**
 * Controller to fetch weekly AI-powered insights.
 */
export const getWeeklyInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Fetch all required analytics data
    const categories = await analyticsService.getCategoryAnalytics(userId);
    const forecast = await analyticsService.getForecast(userId);
    const health = await analyticsService.getFinancialHealth(userId);

    // 2. Calculate total spending for the month
    const totalSpent = categories.reduce((sum, item) => sum + item.total, 0);

    // 3. Prepare data for Gemini
    const insightData: insightService.InsightInputData = {
      totalSpent,
      categories,
      forecast: {
        forecastSpend: forecast.forecastSpend,
      },
      healthScore: health.healthScore,
    };

    // 4. Generate AI insights
    const aiResponse = await insightService.generateInsights(insightData);

    // 5. Return structured response
    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error: any) {
    console.error('Error generating insights:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate financial insights. Please try again later.',
      error: error.message,
    });
  }
};
