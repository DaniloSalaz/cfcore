import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useApiClient } from '@/app/ApiClientProvider';
import { useI18n } from '@/i18n';
import { Menu, Plus } from 'lucide-react';


export function Expenses() {

  return (
    <div className="flex flex-col h-screen bg-background dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 px-4 py-6 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {t('expenses.title')}
          </h1>
          <button
            className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/90"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2">
          {weeks.map((week) => (
            <button
              key={week.id}
              onClick={() => handleSelectWeek(week)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedWeek?.id === week.id
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {formatWeekRange(week.weekStartDate, week.weekEndDate)}
            </button>
          ))}
        </div>
      </div>

      {/* <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 pb-24">
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No expenses yet
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">
                  {formatDate(expense.date)}
                </div>
                <div className="font-semibold text-foreground">
                  {expense.description}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">●</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {expense.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">
                  {formatAmount(expense.amount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setModal({ isOpen: true })}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-lg"
      >
        <Plus size={28} />
      </button>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              {t('expenses.newExpense')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('expenses.detail')}
                </label>
                <input
                  type="text"
                  value={modal.detail || ''}
                  onChange={(e) =>
                    setModal({ ...modal, detail: e.target.value })
                  }
                  placeholder={t('expenses.enterDetail')}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-white dark:bg-gray-700 text-foreground placeholder-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('expenses.amount')}
                </label>
                <div className="flex items-center">
                  <span className="text-2xl text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={modal.amount || ''}
                    onChange={(e) =>
                      setModal({ ...modal, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="flex-1 px-3 py-3 border border-border rounded-lg bg-white dark:bg-gray-700 text-foreground placeholder-muted-foreground"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('expenses.invoice')}
                </label>
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedWeek
                    ? `${new Date(
                        selectedWeek.weekStartDate
                      ).toLocaleDateString()} - ${new Date(
                        selectedWeek.weekEndDate
                      ).toLocaleDateString()}`
                    : ''}
                </div>
                <input
                  type="date"
                  value={modal.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setModal({ ...modal, date: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-white dark:bg-gray-700 text-foreground"
                />
              </div>
            </div>

            <button
              onClick={handleCreateExpense}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('common.create')}
            </button>

            <button
              onClick={() => setModal({ isOpen: false })}
              className="w-full py-3 text-secondary font-semibold"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}
