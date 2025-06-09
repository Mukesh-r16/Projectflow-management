# ProjectFlow Management

A Monday.com-style project management application with Kanban boards, task tracking, and team collaboration features.

## 🚀 Features

- **Kanban Board View** - Drag-and-drop task management
- **Task Management** - Create, edit, assign, and track tasks
- **Team Collaboration** - User assignment and team member management
- **Dashboard Analytics** - Task statistics and progress tracking
- **Timeline View** - Project timeline visualization
- **Calendar Integration** - Due date tracking and calendar view
- **Priority Management** - High, Medium, Low priority levels
- **Real-time Updates** - Live data synchronization

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **MySQL** - Database (with in-memory fallback)
- **Drizzle ORM** - Database operations

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **TanStack Query** - Data fetching
- **Wouter** - Routing

## 🏗️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- MySQL (optional - uses in-memory storage by default)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Mukesh-r16/Projectflow-management.git
cd Projectflow-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your database credentials (optional)
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Shadcn UI components
│   │   │   └── board/      # Kanban board components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage layer
│   └── db.ts               # Database connection
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts           # Database schema and types
└── package.json            # Dependencies and scripts
```

## 🎯 Usage

### Dashboard
- View project overview with task statistics
- Switch between Kanban and timeline views
- Monitor team progress and deadlines

### Kanban Board
- **Columns**: Not Started, In Progress, Completed
- **Drag & Drop**: Move tasks between status columns
- **Quick Add**: Click "+" button to create new tasks
- **Task Details**: Click any task to view/edit details

### Task Management
- Create tasks with descriptions, due dates, and priorities
- Assign tasks to team members
- Set priority levels (High, Medium, Low)
- Track estimated vs actual hours

### Views Available
- **Dashboard** - Main overview with Kanban board
- **Timeline** - Project timeline and milestones
- **Calendar** - Calendar view of tasks and deadlines
- **Reports** - Analytics and progress charts

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Database Configuration
The application uses in-memory storage by default. To use MySQL:

1. Set up MySQL database
2. Configure `.env` file:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ProjectFlow
```

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your contact information]

---

**ProjectFlow Management** - Streamline your team's productivity with intuitive project management tools.
