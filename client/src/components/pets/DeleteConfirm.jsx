/**
 * components/pets/DeleteConfirm.jsx
 * A small, focused confirmation modal for destructive actions.
 */
export default function DeleteConfirm({ petName, onConfirm, onCancel, isLoading }) {
  return (
    <div className="text-center py-2">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center
        text-3xl mx-auto mb-5">
        🗑️
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Remove Pet?</h3>
      <p className="text-gray-400 text-sm mb-1">
        Are you sure you want to remove{' '}
        <span className="text-white font-semibold">{petName}</span> from your account?
      </p>
      <p className="text-gray-600 text-xs mb-8">
        This action can be undone by contacting support.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="btn-outline flex-1 justify-center text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          id="confirm-delete-pet-btn"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
            bg-red-500/20 border border-red-500/50 text-red-400
            hover:bg-red-500/30 hover:border-red-400 transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <><span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Removing…</>
            : '🗑️ Yes, Remove'
          }
        </button>
      </div>
    </div>
  );
}
