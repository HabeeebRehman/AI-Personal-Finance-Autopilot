export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  createdAt: string | Date;
}

export interface ChartData {
  x: Date;
  y: number;
}

/**
 * Processes a list of expenses into a format suitable for Victory Native Line chart.
 * Groups expenses by date and sums the amounts.
 */
export const processSpendingTrendData = (expenses: Expense[]): ChartData[] => {
  if (!expenses || expenses.length === 0) return [];

  // Group expenses by date and sum amounts
  const grouped = expenses.reduce((acc: Record<string, number>, expense) => {
    const dateStr = typeof expense.createdAt === 'string' 
      ? expense.createdAt.split('T')[0] 
      : expense.createdAt.toISOString().split('T')[0];
    
    acc[dateStr] = (acc[dateStr] || 0) + expense.amount;
    return acc;
  }, {});

  // Convert to Victory format and sort by date
  return Object.keys(grouped)
    .map((date) => ({
      x: new Date(date),
      y: grouped[date],
    }))
    .sort((a, b) => a.x.getTime() - b.x.getTime());
};
