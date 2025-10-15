import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  timestamp: string;
}

interface TailCoinsContextType {
  balance: number;
  history: Transaction[];
  addCoins: (amount: number, source: string) => Promise<void>;
  spendCoins: (amount: number, source: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const TailCoinsContext = createContext<TailCoinsContextType | undefined>(undefined);

export function TailCoinsProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(100); // Initial balance
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const balanceStr = await AsyncStorage.getItem('tailcoins_balance');
      const historyStr = await AsyncStorage.getItem('tailcoins_history');
      
      if (balanceStr) setBalance(parseInt(balanceStr));
      if (historyStr) setHistory(JSON.parse(historyStr));
    } catch (error) {
      console.error('Error loading TailCoins:', error);
    }
  };

  const saveBalance = async (newBalance: number, newHistory: Transaction[]) => {
    try {
      await AsyncStorage.setItem('tailcoins_balance', newBalance.toString());
      await AsyncStorage.setItem('tailcoins_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving TailCoins:', error);
    }
  };

  const addCoins = async (amount: number, source: string) => {
    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'earn',
      amount,
      source,
      timestamp: new Date().toISOString(),
    };

    const newBalance = balance + amount;
    const newHistory = [transaction, ...history];
    
    setBalance(newBalance);
    setHistory(newHistory);
    await saveBalance(newBalance, newHistory);
  };

  const spendCoins = async (amount: number, source: string): Promise<boolean> => {
    if (balance < amount) {
      return false; // Insufficient balance
    }

    const transaction: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'spend',
      amount,
      source,
      timestamp: new Date().toISOString(),
    };

    const newBalance = balance - amount;
    const newHistory = [transaction, ...history];
    
    setBalance(newBalance);
    setHistory(newHistory);
    await saveBalance(newBalance, newHistory);
    
    return true;
  };

  const refreshBalance = async () => {
    await loadBalance();
  };

  return (
    <TailCoinsContext.Provider value={{ balance, history, addCoins, spendCoins, refreshBalance }}>
      {children}
    </TailCoinsContext.Provider>
  );
}

export function useTailCoins() {
  const context = useContext(TailCoinsContext);
  if (!context) {
    throw new Error('useTailCoins must be used within TailCoinsProvider');
  }
  return context;
}
