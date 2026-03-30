import { useState } from 'react';

const RoomList = ({ rooms, activeRoom, onSelectRoom, onCreateRoom, onDeleteRoom, loading, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError('Room name is required');
    setCreating(true);
    try {
      await onCreateRoom(form.name.trim(), form.description.trim());
      setForm({ name: '', description: '' });
      setShowModal(false);
      setFormError('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <span className="room-list-label">Rooms</span>
        <button
          className="create-room-btn"
          onClick={() => setShowModal(true)}
          title="Create new room"
          aria-label="Create new room"
        >
          +
        </button>
      </div>

      {loading ? (
        <div className="rooms-loading">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="room-skeleton" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="rooms-empty">No rooms yet. Create one!</p>
      ) : (
        <ul className="rooms-ul">
          {rooms.map((room) => (
            <li
              key={room._id}
              className={`room-item ${activeRoom?._id === room._id ? 'active' : ''}`}
              onClick={() => onSelectRoom(room)}
            >
              <span className="room-hash">#</span>
              <span className="room-item-name">{room.name}</span>
              {room.createdBy?._id === currentUser?._id && (
                <button
                  className="room-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete room "${room.name}"?`)) {
                      onDeleteRoom(room._id);
                    }
                  }}
                  title="Delete room"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Create Room Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create a Room</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              {formError && <div className="auth-error">{formError}</div>}
              <div className="form-group">
                <label htmlFor="room-name">Room Name</label>
                <input
                  id="room-name"
                  type="text"
                  placeholder="e.g. general"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setFormError(''); }}
                  maxLength={50}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="room-desc">Description (optional)</label>
                <input
                  id="room-desc"
                  type="text"
                  placeholder="What is this room about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? <span className="btn-spinner" /> : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
