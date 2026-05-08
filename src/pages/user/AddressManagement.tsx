import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AddressManagement() {
  const addresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      street: '123 Gaming Street, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      name: 'John Doe',
      street: '456 Tech Boulevard',
      city: 'San Jose',
      state: 'CA',
      zip: '95110',
      isDefault: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Saved Addresses</h1>
        <button className="flex items-center gap-2 bg-gaming-accent text-black px-4 py-2 rounded-lg font-bold hover:bg-gaming-accent/90 transition-colors">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className={`bg-gaming-card border rounded-xl p-6 relative ${address.isDefault ? 'border-gaming-accent' : 'border-gaming-border'}`}>
            {address.isDefault && (
              <span className="absolute top-4 right-4 bg-gaming-accent text-black text-xs font-bold px-2 py-1 rounded">
                Default
              </span>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gaming-bg rounded-lg">
                <MapPin className="h-5 w-5 text-gaming-accent" />
              </div>
              <h3 className="font-bold text-white">{address.type}</h3>
            </div>

            <div className="space-y-1 text-gaming-muted text-sm mb-6">
              <p className="text-white font-medium">{address.name}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zip}</p>
            </div>

            <div className="flex gap-3 border-t border-gaming-border pt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gaming-bg hover:bg-gaming-border rounded-lg text-white text-sm transition-colors">
                <Edit2 className="h-4 w-4" /> Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gaming-bg hover:bg-red-500/10 hover:text-red-400 rounded-lg text-gaming-muted text-sm transition-colors">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
