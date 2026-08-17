import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';

const sidebarItems = [
  {
    links: [
      { icon: '▤', text: 'Hotel requests', href: '/admin' },
      { icon: '🏨', text: 'All hotels', href: '/admin/hotels' },
      { icon: '✦', text: 'Cleaning teams', active: true },
      { icon: '📈', text: 'Platform analytics', href: '/admin/analytics' },
      { icon: '🔔', text: 'Notifications', href: '/admin/notifications' },
    ],
  },
  {
    label: 'Account',
    links: [
      { icon: '⚙', text: 'Settings', href: '/admin/settings' },
      { icon: '⏻', text: 'Log out', href: '/' },
    ],
  },
];

export default function CleaningTeams() {
  const { user, logout } = useAuth();
  const [cleaningRequests, setCleaningRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCleaningData();
  }, []);

  const loadCleaningData = () => {
    setCleaningRequests([
      {
        id: 1,
        hotel_name: 'The Marlow Hotel',
        hotel_city: 'Lahore, PK',
        requested_date: '2026-08-16T10:30:00Z',
        status: 'requested',
        priority: 'high',
        room_count: 24,
        estimated_hours: 8
      },
      {
        id: 2,
        hotel_name: 'Coral Bay Villas',
        hotel_city: 'Zanzibar, TZ',
        requested_date: '2026-08-15T14:20:00Z',
        status: 'assigned',
        assigned_team: 'Team Alpha',
        priority: 'medium',
        room_count: 12,
        estimated_hours: 4
      },
      {
        id: 3,
        hotel_name: 'Sierra Guest House',
        hotel_city: 'Goa, IN',
        requested_date: '2026-08-14T09:15:00Z',
        status: 'completed',
        assigned_team: 'Team Beta',
        priority: 'low',
        room_count: 8,
        estimated_hours: 3,
        completed_date: '2026-08-14T16:30:00Z'
      }
    ]);

    setTeams([
      {
        id: 1,
        name: 'Team Alpha',
        leader: 'Sarah Johnson',
        members: 4,
        status: 'busy',
        current_location: 'Zanzibar, TZ',
        specialties: ['Deep Cleaning', 'Luxury Hotels'],
        rating: 4.8,
        completed_jobs: 156
      },
      {
        id: 2,
        name: 'Team Beta',
        leader: 'Michael Chen',
        members: 3,
        status: 'available',
        current_location: 'Available',
        specialties: ['Quick Turnaround', 'Guest Houses'],
        rating: 4.6,
        completed_jobs: 89
      },
      {
        id: 3,
        name: 'Team Gamma',
        leader: 'Amara Osei',
        members: 5,
        status: 'available',
        current_location: 'Available',
        specialties: ['Large Properties', 'Event Cleanup'],
        rating: 4.9,
        completed_jobs: 203
      }
    ]);
    
    setLoading(false);
  };

  const assignTeam = (requestId, teamName) => {
    setCleaningRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'assigned', assigned_team: teamName }
          : req
      )
    );

    setTeams(teamList =>
      teamList.map(team =>
        team.name === teamName
          ? { ...team, status: 'busy' }
          : team
      )
    );
  };

  const completeJob = (requestId) => {
    setCleaningRequests(requests =>
      requests.map(req =>
        req.id === requestId
          ? { ...req, status: 'completed', completed_date: new Date().toISOString() }
          : req
      )
    );
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading cleaning management...
      </div>
    );
  }

  const pendingRequests = cleaningRequests.filter(req => req.status === 'requested');
  const activeJobs = cleaningRequests.filter(req => req.status === 'assigned');
  const availableTeams = teams.filter(team => team.status === 'available');

  return (
    <div className="app-shell">
      <Sidebar
        items={sidebarItems.map(section => ({
          ...section,
          links: section.links.map(link => 
            link.text === 'Log out' ? { ...link, onClick: handleLogout } : link
          )
        }))}
        who={{ 
          initials: 'AD', 
          name: user?.email?.split('@')[0] || 'Admin', 
          subtitle: 'Platform Admin', 
          avatarStyle: { background: 'var(--emerald)', color: '#fff' } 
        }}
      />

      <main className="app-main">
        <div className="app-topbar">
          <h1>Cleaning Teams</h1>
          <div className="topbar-actions">
            <button className="icon-btn">🔔<span className="ping"></span></button>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: '.75rem', background: 'var(--emerald)', color: '#fff' }}>AD</div>
          </div>
        </div>

        <div className="app-body">
          <div className="stat-row">
            <div className="keycard">
              <span className="k-eyebrow">Pending Requests</span>
              <div className="k-value">{pendingRequests.length}</div>
              <span className="k-note">Need team assignment</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Active Jobs</span>
              <div className="k-value">{activeJobs.length}</div>
              <span className="k-note">Currently in progress</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Available Teams</span>
              <div className="k-value">{availableTeams.length}</div>
              <span className="k-note">Ready for assignment</span>
            </div>
            <div className="keycard">
              <span className="k-eyebrow">Total Teams</span>
              <div className="k-value">{teams.length}</div>
              <span className="k-note">Registered cleaning crews</span>
            </div>
          </div>

          <div className="split" style={{ alignItems: 'flex-start', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="panel">
              <div className="panel-head">
                <h3>Cleaning Requests</h3>
                <span className="tag">{cleaningRequests.length} total</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Team</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleaningRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <div className="row-hotel">
                            <div className="thumb"></div>
                            <div>
                              <b>{request.hotel_name}</b>
                              <span>{request.hotel_city} · {request.room_count} rooms</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-stamp ${request.priority}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </span>
                        </td>
                        <td><StatusBadge status={request.status} /></td>
                        <td>
                          {request.assigned_team || <span className="text-muted">—</span>}
                        </td>
                        <td>
                          <div className="table-actions">
                            {request.status === 'requested' && (
                              <select 
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignTeam(request.id, e.target.value);
                                  }
                                }}
                                style={{ fontSize: '.75rem', padding: '4px' }}
                              >
                                <option value="">Assign Team</option>
                                {availableTeams.map(team => (
                                  <option key={team.id} value={team.name}>{team.name}</option>
                                ))}
                              </select>
                            )}
                            {request.status === 'assigned' && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => completeJob(request.id)}
                                style={{ fontSize: '.75rem', padding: '4px 8px' }}
                              >
                                Mark Complete
                              </button>
                            )}
                            {request.status === 'completed' && (
                              <span style={{ fontSize: '.75rem', color: 'var(--emerald)' }}>
                                ✓ Done
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h3>Cleaning Teams</h3>
                <button className="btn btn-brass btn-sm">+ Add Team</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {teams.map((team) => (
                  <div key={team.id} className="team-card" style={{ 
                    padding: '16px', 
                    border: '1px solid var(--hairline)', 
                    borderRadius: '8px',
                    background: team.status === 'available' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <b style={{ fontSize: '.9rem' }}>{team.name}</b>
                          <span className={`badge-stamp ${team.status}`}>
                            <span className="dot"></span>
                            {team.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', margin: '0 0 8px 0' }}>
                          Led by {team.leader} · {team.members} members
                        </p>
                        <p style={{ fontSize: '.75rem', color: 'var(--ink-3)', margin: '0 0 8px 0' }}>
                          📍 {team.current_location}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {team.specialties.map((specialty, idx) => (
                            <span key={idx} style={{
                              fontSize: '.7rem',
                              padding: '2px 6px',
                              background: 'var(--parchment-2)',
                              borderRadius: '4px',
                              color: 'var(--ink-2)'
                            }}>
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '.8rem', fontWeight: '600' }}>
                          ★ {team.rating}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--ink-3)' }}>
                          {team.completed_jobs} jobs
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusMap = {
    'requested': 'pending',
    'assigned': 'approved',
    'completed': 'approved'
  };
  
  const mappedStatus = statusMap[status] || status;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`badge-stamp ${mappedStatus}`}>
      <span className="dot"></span> {label}
    </span>
  );
}