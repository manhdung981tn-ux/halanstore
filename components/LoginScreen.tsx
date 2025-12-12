import React from 'react';
import { Bus, ChevronRight, User } from 'lucide-react';
import { Employee } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ employees, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-brand-blue/80 backdrop-blur-sm"></div>
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue to-blue-900 opacity-10"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Bus className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">HÀ LAN <span className="text-brand-orange">STORE</span></h1>
            <p className="text-slate-500 text-sm font-medium">Hệ thống quản lý & bán hàng</p>
          </div>
        </div>

        <div className="p-8 pt-0 flex-1 flex flex-col bg-slate-50/50">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chọn tài khoản</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-2 no-scrollbar">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => onLogin(emp)}
                    className="w-full flex items-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-brand-blue hover:shadow-md hover:scale-[1.02] transition-all group active:scale-95"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-inner ${emp.role === 'admin' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-brand-blue'}`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800 text-lg">{emp.name}</p>
                      <p className="text-xs text-slate-500 uppercase font-semibold">{emp.role === 'admin' ? 'Quản lý cấp cao' : 'Nhân viên bán hàng'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
        </div>
        
        <div className="bg-white p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">Powered by Hà Lan Buslines Technology</p>
        </div>
      </div>
    </div>
  );
};