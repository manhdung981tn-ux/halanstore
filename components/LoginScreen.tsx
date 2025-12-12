import React from 'react';
import { Bus, ChevronRight, User } from 'lucide-react';
import { Employee } from '../types';

interface LoginScreenProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ employees, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-brand-blue p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Hà Lan Buslines</h1>
          <p className="text-blue-100 text-sm">Hệ thống quản lý bán hàng</p>
        </div>

        <div className="p-8 flex-1 flex flex-col">
            <div className="flex-1 flex flex-col">
              <h2 className="text-center text-slate-500 font-medium mb-6">Chọn nhân viên để bắt đầu</h2>
              <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-2 no-scrollbar">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => onLogin(emp)}
                    className="w-full flex items-center p-4 rounded-xl border border-slate-200 hover:border-brand-blue hover:bg-blue-50 transition-all group active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${emp.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-brand-blue'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-500 uppercase">{emp.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-blue" />
                  </button>
                ))}
              </div>
            </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400">
          Phiên bản nhanh - Không cần mật khẩu
        </div>
      </div>
    </div>
  );
};