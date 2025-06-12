import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const salesData = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+PKR 1,999.00",
    initials: "OM",
    color: "from-blue-500 to-violet-500",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+PKR 39.00",
    initials: "JL",
    color: "from-emerald-500 to-teal-500",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+PKR 299.00",
    initials: "IN",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+PKR 99.00",
    initials: "WK",
    color: "from-violet-500 to-purple-500",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+PKR 39.00",
    initials: "SD",
    color: "from-pink-500 to-rose-500",
  },
]

export function RecentSales() {
  return (
    <div className="space-y-6">
      {salesData.map((sale, index) => (
        <div
          key={index}
          className="flex items-center p-3 rounded-lg backdrop-blur-md bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-700/70 transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-slate-200/30 dark:border-slate-700/30"
        >
          <Avatar className="h-10 w-10 shadow-md hover:scale-110 transition-all duration-300">
            <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
            <AvatarFallback className={`bg-gradient-to-r ${sale.color} text-white font-semibold`}>
              {sale.initials}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1 flex-1">
            <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">{sale.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{sale.email}</p>
          </div>
          <div className="ml-auto font-semibold text-emerald-600 dark:text-emerald-400">{sale.amount}</div>
        </div>
      ))}
    </div>
  )
}
