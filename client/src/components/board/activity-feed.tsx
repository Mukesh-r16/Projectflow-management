import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityFeedProps {
  boardId: number;
}

export default function ActivityFeed({ boardId }: ActivityFeedProps) {
  // In a real app, this would fetch activity data from the API
  const activities = [
    {
      id: 1,
      user: { 
        name: "Sarah Wilson", 
        avatar: "https://pixabay.com/get/g30bf9c360fcbb9e431af4ac3d2368f80460b0bf7a85fbe1de99a9826c1f3d9f294e20a8de86dee8875577a0d9fcf36b5b2692ec7430e0626df6e47ef45cee80b_1280.jpg" 
      },
      action: "updated status to",
      status: "Working on it",
      target: "Launch social media campaign",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: { 
        name: "Mike Chen", 
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32" 
      },
      action: "completed",
      target: "Design banner assets",
      timestamp: "4 hours ago",
    },
    {
      id: 3,
      user: { 
        name: "Emma Davis", 
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=32&h=32" 
      },
      action: "was assigned to",
      target: "Write copy for landing page",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="mt-8 bg-white rounded-lg border border-monday-border p-6">
      <h3 className="text-lg font-semibold monday-dark mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback>
                {activity.user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm monday-dark">
                <span className="font-medium">{activity.user.name}</span>{" "}
                {activity.action}{" "}
                {activity.status && (
                  <>
                    <span className="monday-orange font-medium">{activity.status}</span>{" "}
                    on{" "}
                  </>
                )}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs monday-medium mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
