import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage (set by Shell)
  const getToken = () => localStorage.getItem('token');

  // Fetch all tickets
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new ticket
  const createTicket = async (ticketData) => {
    try {
      const token = getToken();
      
      const response = await axios.post(
        `${API_URL}/tickets`,
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add new ticket to list
      setTickets((prev) => [response.data, ...prev]);
      return { success: true, ticket: response.data };
    } catch (err) {
      console.error('Error creating ticket:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || err.message 
      };
    }
  };

  // Update ticket
  const updateTicket = async (ticketId, updates) => {
    try {
      const token = getToken();
      
      const response = await axios.patch(
        `${API_URL}/tickets/${ticketId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update ticket in list
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? response.data : t))
      );

      return { success: true, ticket: response.data };
    } catch (err) {
      console.error('Error updating ticket:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || err.message 
      };
    }
  };

  // Delete ticket
  const deleteTicket = async (ticketId) => {
    try {
      const token = getToken();
      
      await axios.delete(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove ticket from list
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || err.message 
      };
    }
  };

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Poll for updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}