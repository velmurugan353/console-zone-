import { Wrench, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function MyRepairRequests() {
  const repairs = [
    {
      id: 'REP-2023-001',
      device: 'PlayStation 5 DualSense Controller',
      issue: 'Stick Drift on Left Analog',
      date: 'Oct 20, 2023',
      status: 'In Progress',
      estimatedCompletion: 'Oct 30, 2023'
    },
    {
      id: 'REP-2023-002',
      device: 'Nintendo Switch Joy-Con',
      issue: 'Not Charging',
      date: 'Aug 15, 2023',
      status: 'Completed',
      estimatedCompletion: 'Aug 20, 2023'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Repair Requests</h1>
        <button className="bg-gaming-accent text-black px-4 py-2 rounded-lg font-bold hover:bg-gaming-accent/90 transition-colors">
          New Request
        </button>
      </div>
      
      <div className="space-y-4">
        {repairs.map((repair) => (
          <div key={repair.id} className="bg-gaming-card border border-gaming-border rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gaming-bg rounded-lg border border-gaming-border">
                  <Wrench className="h-6 w-6 text-gaming-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{repair.device}</h3>
                  <p className="text-gaming-muted text-sm">Issue: {repair.issue}</p>
                  <p className="text-gaming-muted text-xs font-mono mt-1">{repair.id}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  repair.status === 'Completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                }`}>
                  {repair.status}
                </span>
                <span className="text-xs text-gaming-muted">Submitted: {repair.date}</span>
              </div>
            </div>

            <div className="bg-gaming-bg/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white">
                <Clock className="h-4 w-4 text-gaming-accent" />
                <span>Estimated Completion: <span className="font-bold">{repair.estimatedCompletion}</span></span>
              </div>
              <button className="text-gaming-accent hover:text-white text-sm flex items-center gap-2 transition-colors">
                <MessageSquare className="h-4 w-4" />
                Contact Technician
              </button>
            </div>

            {/* Progress Bar (Mock) */}
            {repair.status === 'In Progress' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gaming-muted mb-1">
                  <span>Received</span>
                  <span>Diagnosed</span>
                  <span className="text-white font-bold">Repairing</span>
                  <span>Testing</span>
                  <span>Ready</span>
                </div>
                <div className="h-2 bg-gaming-bg rounded-full overflow-hidden">
                  <div className="h-full bg-gaming-accent w-[60%] rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
