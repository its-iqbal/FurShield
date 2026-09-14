/**
 * hooks/usePets.js
 * Custom hook that manages the full pet list state:
 * fetching, adding, updating, deleting, and selection.
 */
import { useState, useEffect, useCallback } from 'react';
import PetService from '../api/petService.js';

export default function usePets() {
  const [pets,       setPets]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activePetId, setActivePetId] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await PetService.getMyPets();
      setPets(data.data);
      // Auto-select the first pet if none selected
      if (data.data.length > 0 && !activePetId) {
        setActivePetId(data.data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPets(); }, [fetchPets]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addPet = useCallback(async (formData) => {
    const { data } = await PetService.addPet(formData);
    setPets((prev) => [data.data, ...prev]);
    setActivePetId(data.data._id);
    return data.data;
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const updatePet = useCallback(async (id, formData) => {
    const { data } = await PetService.updatePet(id, formData);
    setPets((prev) => prev.map((p) => (p._id === id ? data.data : p)));
    return data.data;
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deletePet = useCallback(async (id) => {
    await PetService.deletePet(id);
    setPets((prev) => {
      const remaining = prev.filter((p) => p._id !== id);
      // Move selection to adjacent pet
      if (activePetId === id) {
        setActivePetId(remaining[0]?._id ?? null);
      }
      return remaining;
    });
  }, [activePetId]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const activePet = pets.find((p) => p._id === activePetId) ?? null;

  return {
    pets,
    loading,
    error,
    activePet,
    activePetId,
    setActivePetId,
    fetchPets,
    addPet,
    updatePet,
    deletePet,
  };
}
