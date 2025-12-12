import React, { useState } from 'react';
import { Save, CheckCircle, FileSpreadsheet, Copy, Zap, AlertCircle, CreditCard, Plus, Trash2, Building, User, Users, Shield } from 'lucide-react';
import { AppSettings, BankAccount, Employee } from '../types';
import { sendTestToGoogleSheet } from '../utils';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>({
    ...settings,
    bankAccounts: settings.bankAccounts || [], 
    employees: settings.employees || []
  });
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // New account form state
  const [newAccount, setNewAccount] = useState<Omit<BankAccount, 'id'>>({
    bankName: '',
    accountNumber: '',
    ownerName: ''
  });

  // New Employee form state
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, 'id'>>({
      name: '',
      pin: '',
      role: 'staff'
  });

  const handleSave = () => {
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // --- Bank Logic ---
  const handleAddAccount = () => {
    if (!newAccount.bankName || !newAccount.accountNumber) return;
    const account: BankAccount = { id: Date.now().toString(), ...newAccount };
    setFormData(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, account] }));
    setNewAccount({ bankName: '', accountNumber: '', ownerName: '' });
  };

  const handleDeleteAccount = (id: string) => {
    setFormData(prev => ({ ...prev, bankAccounts: prev.bankAccounts.filter(acc => acc.id !== id) }));
  };

  // --- Employee Logic ---
  const handleAddEmployee = () => {
      if (!newEmployee.name || !newEmployee.pin || newEmployee.pin.length !== 4) {
          alert("Vui lòng nhập tên và mã PIN 4 chữ số");
          return;
      }
      const employee: Employee = { id: Date.now().toString(), ...newEmployee };
      setFormData(prev => ({ ...prev, employees: [...prev.employees, employee] }));
      setNewEmployee({ name: '', pin: '', role: 'staff' });
  };

  const handleDeleteEmployee = (id: string) => {
      // Prevent deleting the last admin
      const empToDelete = formData.employees.find(e => e.id === id);
      const adminCount = formData.employees.filter(e => e.role === 'admin').length;
      if (empToDelete?.role === 'admin' && adminCount <= 1) {
          alert("Không thể xóa tài khoản Quản lý cuối cùng!");
          return;
      }
      if (confirm('Xóa nhân viên này?')) {
          setFormData(prev => ({ ...prev, employees: prev.employees.filter(e => e.id !== id) }));
      }
  };


  const handleTestConnection = async () => {
    if (!formData.googleScriptUrl) return;
    setIsTesting(true);
    await sendTestToGoogleSheet(formData.googleScriptUrl);
    setTimeout(() => {
        setIsTesting(false);
        alert('Đã gửi yêu cầu test! Hãy kiểm tra Google Sheet.');
    }, 1000);
  };

  const sampleScript = `
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tự động tạo header nếu file mới
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian", "Mã đơn", "Nhân viên", "Chi tiết hàng hóa", "Tổng tiền", "Lợi nhuận", "HTTT", "Chi tiết thanh toán"]);
    }
    
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.date, 
      data.orderId,
      data.employeeName,
      data.items, 
      data.totalAmount, 
      data.totalProfit,
      data.paymentMethod,
      data.paymentNote
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: e}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
  `.trim();

  const copyScript = () => {
    navigator.clipboard.writeText(sampleScript);
    alert('Đã sao chép mã Script mới!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-24">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-sm z-30 py-2">
        <h2 className="text-2xl font-bold text-slate-800">Cài đặt</h2>
      </div>

      {/* --- EMPLOYEE MANAGEMENT --- */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue" />
              Quản lý Nhân viên & Phân quyền
          </h3>
          <div className="space-y-4">
              <div className="space-y-3">
                  {formData.employees.map((emp) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${emp.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-brand-blue'}`}>
                                  {emp.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                              </div>
                              <div>
                                  <p className="font-bold text-slate-800 text-sm">{emp.name} {emp.id === '1' && '(Mặc định)'}</p>
                                  <p className="text-xs text-slate-500">PIN: **** • {emp.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</p>
                              </div>
                          </div>
                          <button 
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Thêm nhân viên mới</p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                      <input
                          type="text"
                          placeholder="Tên nhân viên"
                          className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      />
                      <input
                          type="number"
                          placeholder="PIN (4 số)"
                          maxLength={4}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue"
                          value={newEmployee.pin}
                          onChange={(e) => setNewEmployee({...newEmployee, pin: e.target.value.slice(0, 4)})}
                      />
                      <select 
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue bg-white"
                          value={newEmployee.role}
                          onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value as 'admin' | 'staff'})}
                      >
                          <option value="staff">Nhân viên</option>
                          <option value="admin">Quản lý</option>
                      </select>
                  </div>
                  <button
                      onClick={handleAddEmployee}
                      disabled={!newEmployee.name || newEmployee.pin.length < 4}
                      className="w-full py-2 bg-white border border-brand-blue text-brand-blue font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Plus className="w-4 h-4" /> Thêm nhân viên
                  </button>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          Kết nối Google Sheets
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Google Apps Script URL</label>
            <div className="flex gap-2">
                <input
                type="url"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                placeholder="https://script.google.com/macros/s/..."
                value={formData.googleScriptUrl}
                onChange={(e) => setFormData({ ...formData, googleScriptUrl: e.target.value })}
                />
                <button
                    onClick={handleTestConnection}
                    disabled={!formData.googleScriptUrl || isTesting}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs flex flex-col items-center justify-center min-w-[80px] transition-colors"
                >
                    {isTesting ? (
                        <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 mb-1 text-orange-500" />
                            Test
                        </>
                    )}
                </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Mã Script mẫu (V3 - Có tên nhân viên)
              </span>
              <button onClick={copyScript} className="text-brand-blue text-xs font-bold flex items-center gap-1 hover:underline">
                <Copy className="w-3 h-3" /> Sao chép
              </button>
            </div>
            <pre className="text-[10px] text-slate-600 overflow-x-auto bg-white p-2 rounded border border-slate-200 max-h-40">
              {sampleScript}
            </pre>
            <div className="mt-2 text-[10px] text-orange-500 italic">
                * Lưu ý: Hãy cập nhật lại Script để thêm cột "Nhân viên" và "Chi tiết thanh toán".
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-50">
        <h3 className="font-bold text-slate-800 mb-4">Thông tin cửa hàng & Ngân hàng</h3>
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tên cửa hàng</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    />
                </div>
            </div>
            
            {/* Bank Accounts Management */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> 
                    Danh sách Tài khoản Ngân hàng
                </label>
                
                <div className="space-y-3 mb-4">
                    {formData.bankAccounts.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-blue shadow-sm">
                                    <Building className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{acc.bankName}</p>
                                    <p className="text-xs text-slate-500">{acc.accountNumber} - {acc.ownerName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDeleteAccount(acc.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {formData.bankAccounts.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-2">Chưa có tài khoản nào được thêm</p>
                    )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase">Thêm tài khoản mới</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Tên ngân hàng (VD: MBBank)"
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue"
                            value={newAccount.bankName}
                            onChange={(e) => setNewAccount({...newAccount, bankName: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Số tài khoản"
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue"
                            value={newAccount.accountNumber}
                            onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                        />
                         <input
                            type="text"
                            placeholder="Chủ tài khoản"
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-blue"
                            value={newAccount.ownerName}
                            onChange={(e) => setNewAccount({...newAccount, ownerName: e.target.value})}
                        />
                    </div>
                    <button
                        onClick={handleAddAccount}
                        disabled={!newAccount.bankName || !newAccount.accountNumber}
                        className="w-full py-2 bg-white border border-brand-blue text-brand-blue font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" /> Thêm tài khoản
                    </button>
                </div>
            </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
          saved ? 'bg-green-500 shadow-green-500/30' : 'bg-brand-blue hover:bg-blue-700 shadow-blue-500/30'
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="w-5 h-5" /> Đã lưu cài đặt
          </>
        ) : (
          <>
            <Save className="w-5 h-5" /> Lưu thay đổi
          </>
        )}
      </button>
    </div>
  );
};