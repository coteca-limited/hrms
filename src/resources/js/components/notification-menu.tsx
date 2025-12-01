import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';

export const NotificationMenu: React.FC = () => {
    const { notifications } = usePage().props as any;
    const [data] = useState(notifications);

    const unreadCount =
        (data?.leaves?.filter(x => !x.read)?.length || 0) +
        (data?.birthdays?.filter(x => !x.read)?.length || 0) +
        (data?.anniversary?.filter(x => !x.read)?.length || 0) +
        (data?.complaints?.filter(x => !x.read)?.length || 0) +
        (data?.awards?.filter(x => !x.read)?.length || 0);

    // Mark read then redirect
    const handleNotificationClick = (type: string, ref_id: number, redirectRoute: string) => {
        router.post(route('notifications.markRead'), { type, ref_id }, {
            preserveScroll: true,
            onSuccess: () => router.visit(redirectRoute),
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 h-8 rounded-md">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-96 max-h-[680px] overflow-y-auto no-scrollbar"
                align="end"
                forceMount
            >
                <DropdownMenuGroup className="space-y-1 py-1">

                    {/* ---------------- Leaves ---------------- */}
                    {data?.leaves?.length > 0 && (
                        <>
                            <span className="text-[11px] font-semibold text-gray-500 px-3 py-1">Leaves</span>
                            {data.leaves.map((leave: any, i: number) => (
                                <DropdownMenuItem
                                    key={i}
                                    onClick={() =>
                                        handleNotificationClick('leaves', leave.id, route('hr.leave-applications.index'))
                                    }
                                    className={`flex flex-col items-start text-sm cursor-pointer rounded-md ${
                                        leave.read ? 'bg-gray-100 text-gray-400' : 'font-semibold'
                                    }`}
                                >
                                    🧑 {leave.employee}
                                    <span className="text-xs flex items-center gap-1">
                                        <span
                                            className="inline-block w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: leave.color }}
                                        />
                                        {leave.leave_type}
                                        &nbsp;•&nbsp;
                                        {format(new Date(leave.start), 'dd MMM yyyy')}
                                        {leave.end !== leave.start &&
                                            ` - ${format(new Date(leave.end), 'dd MMM yyyy')}`}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* ---------------- Birthdays ---------------- */}
                    {data?.birthdays?.length > 0 && (
                        <>
                            <span className="text-[11px] font-semibold text-gray-500 px-3 py-1">🎂 Birthdays</span>
                            {data.birthdays.map((b: any, i: number) => (
                                <DropdownMenuItem
                                    key={i}
                                    onClick={() =>
                                        handleNotificationClick('birthdays', b.id, route('hr.employees.index'))
                                    }
                                    className={`flex flex-col items-start text-sm cursor-pointer rounded-md ${
                                        b.read ? 'bg-gray-100 text-gray-400' : 'font-semibold'
                                    }`}
                                >
                                    🎂 {b.employee} — Birthday today
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* ---------------- Anniversaries ---------------- */}
                    {data?.anniversary?.length > 0 && (
                        <>
                            <span className="text-[11px] font-semibold text-gray-500 px-3 py-1">
                                🏅 Work Anniversaries
                            </span>
                            {data.anniversary.map((a: any, i: number) => (
                                <DropdownMenuItem
                                    key={i}
                                    onClick={() =>
                                        handleNotificationClick('anniversary', a.id, route('hr.employees.index'))
                                    }
                                    className={`flex flex-col items-start text-sm cursor-pointer rounded-md ${
                                        a.read ? 'bg-gray-100 text-gray-400' : 'font-semibold'
                                    }`}
                                >
                                    🏅 {a.employee} — {a.years} years completed today
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    {/* ---------------- Complaints ---------------- */}
                    {data?.complaints?.length > 0 && (
                        <>
                            <span className="text-[11px] font-semibold text-gray-500 px-3 py-1">🚨 Complaints</span>
                            {data.complaints.map((c: any, i: number) => (
                                <DropdownMenuItem
                                    key={i}
                                    onClick={() =>
                                        handleNotificationClick('complaints', c.id, route('hr.complaints.index'))
                                    }
                                    className={`flex flex-col items-start text-sm cursor-pointer rounded-md ${
                                        c.read ? 'bg-gray-100 text-gray-400' : 'font-semibold'
                                    }`}
                                >
                                    🚨 {c.subject}
                                    <span className="text-xs opacity-75">
                                        {c.employee} vs {c.against} — {c.date}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}

                    {data?.awards?.length > 0 && (
                        <>
                            <span className="text-[11px] font-semibold text-gray-500 px-3 py-1">🏆 Awards</span>
                            {data.awards.map((a: any, i: number) => (
                                <DropdownMenuItem
                                    key={i}
                                    onClick={() =>
                                        handleNotificationClick('awards', a.id, route('hr.awards.index'))
                                    }
                                    className={`flex flex-col items-start text-sm cursor-pointer rounded-md ${
                                        a.read ? 'bg-gray-100 text-gray-400' : 'font-semibold'
                                    }`}
                                >
                                    🏆 {a.employee} {a.award_type}
                                    <span className="text-xs opacity-75">
                                        {a.date} — Gift: {a.gift ?? 'N/A'} {a.value ? ` (₹${a.value})` : ''}
                                    </span>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}

                    {/* ---------------- No notifications ---------------- */}
                    {unreadCount === 0 && (
                        <DropdownMenuItem className="justify-center text-gray-500 text-sm cursor-default py-4">
                            No notifications
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
