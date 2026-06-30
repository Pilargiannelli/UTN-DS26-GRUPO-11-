import type React from "react";

export function useDate(fieldName: string) {
    const getDaysInMonth = (month: number, year: number): number => {
        if (month === 2) {
            const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
            return isLeap ? 29 : 28;
        }
        if ([4, 6, 9, 11].includes(month)) return 30; return 31;
    };
    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const val = parseInt(rawValue, 10);
        if (isNaN(val)) return;
        const monthInput = e.target.form?.querySelector(`[name="${fieldName}.month"]`) as HTMLInputElement;
        const yearInput = e.target.form?.querySelector(`[name="${fieldName}.year"]`) as HTMLInputElement;
        const currentMonth = monthInput ? parseInt(monthInput.value, 10) : 1;
        const currentYear = yearInput ? parseInt(yearInput.value, 10) : 2026;
        const maxDays = getDaysInMonth(currentMonth, currentYear);
        if (val > maxDays) e.target.value = String(maxDays);
        if (val < 1 && rawValue.length === 2) { e.target.value = "01";
    }
    };
    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        let val = parseInt(rawValue, 10);
        if (isNaN(val)) return;
        if (val > 12) {
            val = 12;
            e.target.value = "12";
        }
        if (val < 1 && rawValue.length === 2) {
            val = 1;
            e.target.value = "01";
        }
        const dayInput = e.target.form?.querySelector(`[name="${fieldName}.day"]`) as HTMLInputElement;
        const yearInput = e.target.form?.querySelector(`[name="${fieldName}.year"]`) as HTMLInputElement;
        if (dayInput && dayInput.value) {
            const currentDay = parseInt(dayInput.value, 10);
            const currentYear = yearInput ? parseInt(yearInput.value, 10) : 2026;
            const maxDays = getDaysInMonth(val, currentYear);
            if (currentDay > maxDays) {
                dayInput.value = String(maxDays);
                dayInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || e.target.value.length !== 4) return;
        const dayInput = e.target.form?.querySelector(`[name="${fieldName}.day"]`) as HTMLInputElement;
        const monthInput = e.target.form?.querySelector(`[name="${fieldName}.month"]`) as HTMLInputElement;
        if (dayInput && monthInput && parseInt(monthInput.value, 10) === 2) {
            const currentDay = parseInt(dayInput.value, 10);
            const maxDays = getDaysInMonth(2, val);
            if (currentDay > maxDays) {
                dayInput.value = String(maxDays);
                dayInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    };
    return { handleDayChange, handleMonthChange, handleYearChange, };
}