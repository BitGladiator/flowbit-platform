import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getToken = () => localStorage.getItem('token');
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
  const deleteTicket = async (ticketId) => {
    try {
      const token = getToken();
      
      await axios.delete(`${API_URL}/tickets/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
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