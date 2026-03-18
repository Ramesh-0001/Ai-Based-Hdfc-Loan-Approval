import React, { useMemo } from 'react';

const ActivityHeatmap = () => {
    // Generate mock data for the last 365 days
    const generateActivityData = () => {
        const data = [];
        const today = new Date();
        const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);
            
            // Randomize activity. Most days 0, some days 1-4.
            const isActivityDay = Math.random() > 0.85;
            let level = 0;
            if (isActivityDay) {
                const rand = Math.random();
                if (rand < 0.5) level = 1;
                else if (rand < 0.8) level = 2;
                else if (rand < 0.95) level = 3;
                else level = 4;
            }
            
            data.push({
                date,
                level
            });
        }
        return data;
    };

    const activityData = useMemo(() => generateActivityData(), []);

    // Grouping by columns (weeks) and rows (days of week)
    // The matrix has 7 rows (Sun-Sat) and 52-53 columns.
    const weeks = [];
    let currentWeek = [];
    
    // Ensure the first day aligns correctly with the day of the week
    const firstDayOfWeek = activityData[0].date.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
    }

    activityData.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    if (currentWeek.length > 0) {
        // Pad the remaining days
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    // Colors mapping
    const getLevelColor = (level) => {
        if (!level || level === 0) return 'bg-gray-100 hover:bg-gray-200';
        if (level === 1) return 'bg-blue-200 hover:bg-blue-300';
        if (level === 2) return 'bg-blue-400 hover:bg-blue-500';
        if (level === 3) return 'bg-blue-600 hover:bg-blue-700';
        return 'bg-blue-800 hover:bg-blue-900';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01] border border-gray-200 font-sans mt-6 overflow-hidden">
             <div className="mb-6">
                 <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Loan application activity</h3>
                 <p className="text-sm text-gray-400 mt-1">Platform interactions regarding EMI models and loan evaluations</p>
             </div>
             
             <div className="overflow-x-auto pb-4 scrollbar-hide">
                 <div className="min-w-[700px]">
                     {/* Month Labels */}
                     <div className="flex ml-8 mb-2">
                        {months.map((m, i) => (
                            <div key={i} className="flex-1 text-[11px] font-medium text-gray-400 text-left">
                                {m}
                            </div>
                        ))}
                     </div>

                     <div className="flex gap-1.5">
                         {/* Day Labels */}
                         <div className="flex flex-col gap-1.5 pt-1 pr-2 text-[10px] font-medium text-gray-400">
                             <div className="h-3.5 mb-[3px]"></div>
                             <div className="h-3.5 leading-none flex items-center mb-[2px]">Mon</div>
                             <div className="h-3.5"></div>
                             <div className="h-3.5 leading-none flex items-center mb-[2px]">Wed</div>
                             <div className="h-3.5"></div>
                             <div className="h-3.5 leading-none flex items-center mb-[2px]">Fri</div>
                             <div className="h-3.5"></div>
                         </div>

                         {/* Heatmap Grid */}
                         {weeks.map((week, wIdx) => (
                             <div key={wIdx} className="flex flex-col gap-1.5">
                                 {week.map((day, dIdx) => (
                                     <div 
                                        key={dIdx} 
                                        className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer ${day ? getLevelColor(day.level) : 'bg-transparent'}`}
                                        title={day ? `${day.date.toDateString()}: ${day.level} interactions` : ''}
                                     />
                                 ))}
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             <div className="mt-6 flex items-center justify-end space-x-2 text-[11px] font-medium text-gray-400">
                 <span className="mr-2">Less active</span>
                 <div className="w-3.5 h-3.5 rounded-sm bg-gray-100"></div>
                 <div className="w-3.5 h-3.5 rounded-sm bg-blue-200"></div>
                 <div className="w-3.5 h-3.5 rounded-sm bg-blue-400"></div>
                 <div className="w-3.5 h-3.5 rounded-sm bg-blue-600"></div>
                 <div className="w-3.5 h-3.5 rounded-sm bg-blue-800"></div>
                 <span className="ml-2">More active</span>
             </div>
        </div>
    );
};

export default ActivityHeatmap;
