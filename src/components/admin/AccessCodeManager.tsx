import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Wand2, Calendar, Clock, ListChecks, Pencil, Check, X, TrendingUp, Users, Shield, Activity, Sparkles, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const AccessCodeManager = () => {
  const [newCode, setNewCode] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [accessCodes, setAccessCodes] = useState<Array<{ 
    code: string; 
    expiry_date: string;
    last_accessed?: string | null;
    name?: string;
    user_name?: string;
    problem_count?: number;
  }>>([]);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<{ code: string; expiry_date: string } | null>(null);
  const [extensionDays, setExtensionDays] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUserName, setEditUserName] = useState("");
  const adminClient = supabase as any;

  const getAdminCode = () => {
    return localStorage.getItem("accessCode") || (localStorage.getItem("isAdmin") === "true" ? "891127" : null);
  };

  // Add useEffect to fetch access codes on component mount and set up realtime subscriptions
  useEffect(() => {
    fetchAccessCodes();

    // Subscribe to access_codes table changes
    const accessCodesChannel = supabase
      .channel('access-codes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'access_codes'
        },
        (payload) => {
          console.log('Access code changed:', payload);
          fetchAccessCodes();
        }
      )
      .subscribe();

    // Subscribe to user_works table changes (for problem count updates)
    const userWorksChannel = supabase
      .channel('user-works-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_works'
        },
        (payload) => {
          console.log('New problem generated:', payload);
          fetchAccessCodes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accessCodesChannel);
      supabase.removeChannel(userWorksChannel);
    };
  }, []);

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const length = 8;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    
    setNewCode(result);
  };

  const fetchAccessCodes = async () => {
    const adminCode = getAdminCode();

    if (!adminCode) {
      setAccessCodes([]);
      return;
    }

    const { data, error } = await adminClient
      .rpc('admin_list_access_codes', { admin_code: adminCode });

    if (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    setAccessCodes((data || []).map((c: any) => ({
      ...c,
      problem_count: c.problem_count || 0,
    })));
  };

  const startEdit = (code: any) => {
    setEditingCodeId(code.code);
    setEditName(code.name || "");
    setEditUserName(code.user_name || "");
  };

  const cancelEdit = () => {
    setEditingCodeId(null);
    setEditName("");
    setEditUserName("");
  };

  const saveEdit = async () => {
    if (!editingCodeId) return;
    const adminCode = getAdminCode();
    if (!adminCode) return;

    const { error } = await adminClient.rpc('admin_update_access_code_profile', {
      admin_code: adminCode,
      target_code: editingCodeId,
      new_name: editName,
      new_user_name: editUserName,
    });

    if (error) {
      toast({
        title: "업데이트 실패",
        description: "이름 업데이트에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "저장 완료",
      description: "이름이 업데이트되었습니다.",
    });

    await fetchAccessCodes();
    cancelEdit();
  };

  const addAccessCode = async () => {
    if (!newCode) {
      toast({
        title: "오류",
        description: "엑세스 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!expiryDays || isNaN(parseInt(expiryDays)) || parseInt(expiryDays) <= 0) {
      toast({
        title: "오류",
        description: "유효한 만료 기간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const adminCode = getAdminCode();
    if (!adminCode) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
    
    if (isNaN(expiryDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 날짜입니다.",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await adminClient.rpc('admin_create_access_code', {
      admin_code: adminCode,
      new_code: newCode,
      new_expiry_date: expiryDate.toISOString(),
    });

    if (error) {
      toast({
        title: "오류 발생",
        description: error.message?.includes('duplicate') ? "이미 존재하는 엑세스 코드입니다." : "엑세스 코드 추가에 실패했습니다.",
        variant: "destructive",
      });
      console.error("Error adding access code:", error);
      return;
    }

    await fetchAccessCodes();
    setNewCode("");
    
    toast({
      title: "성공",
      description: "새로운 엑세스 코드가 추가되었습니다.",
    });
  };

  const removeAccessCode = async (codeToRemove: string) => {
    const adminCode = getAdminCode();
    if (!adminCode) return;

    const { error } = await adminClient.rpc('admin_delete_access_code', {
      admin_code: adminCode,
      target_code: codeToRemove,
    });

    if (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 삭제에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    
    toast({
      title: "성공",
      description: "엑세스 코드가 삭제되었습니다.",
    });
  };

  const handleExtendClick = (code: string, expiry_date: string) => {
    setSelectedCode({ code, expiry_date });
    setIsExtendDialogOpen(true);
  };

  const extendExpiry = async () => {
    if (!selectedCode || !extensionDays) return;

    const days = parseInt(extensionDays);
    if (!days || days <= 0) {
      toast({
        title: "오류",
        description: "유효한 연장 기간을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date(selectedCode.expiry_date);
    if (isNaN(currentDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 만료일입니다.",
        variant: "destructive",
      });
      return;
    }

    currentDate.setDate(currentDate.getDate() + days);

    // Validate the new date before proceeding
    if (isNaN(currentDate.getTime())) {
      toast({
        title: "오류 발생",
        description: "유효하지 않은 날짜가 계산되었습니다.",
        variant: "destructive",
      });
      return;
    }

    const adminCode = getAdminCode();
    if (!adminCode) return;

    const { error } = await adminClient.rpc('admin_extend_access_code', {
      admin_code: adminCode,
      target_code: selectedCode.code,
      new_expiry_date: currentDate.toISOString(),
    });

    if (error) {
      toast({
        title: "오류 발생",
        description: "유효기간 연장에 실패했습니다.",
        variant: "destructive",
      });
      return;
    }

    await fetchAccessCodes();
    setIsExtendDialogOpen(false);
    setExtensionDays("");
    setSelectedCode(null);
    
    toast({
      title: "성공",
      description: `유효기간이 ${days}일 연장되었습니다.`,
    });
  };

  const copyAccessCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "복사 성공",
        description: "엑세스 코드가 클립보드에 복사되었습니다.",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "엑세스 코드 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatLastAccessed = (lastAccessed: string | null) => {
    if (!lastAccessed) return "접속 기록 없음";
    const date = new Date(lastAccessed);
    if (isNaN(date.getTime())) return "유효하지 않은 날짜";
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const separateAccessCodes = () => {
    const now = new Date();
    const valid = accessCodes.filter(code => {
      const expiryDate = new Date(code.expiry_date);
      return !isNaN(expiryDate.getTime()) && expiryDate > now;
    });
    const expired = accessCodes.filter(code => {
      const expiryDate = new Date(code.expiry_date);
      return isNaN(expiryDate.getTime()) || expiryDate <= now;
    });
    return { valid, expired };
  };

  const { valid: validCodes, expired: expiredCodes } = separateAccessCodes();

  const totalCodes = accessCodes.length;
  const totalProblems = accessCodes.reduce((sum, code) => sum + (code.problem_count || 0), 0);
  const activeUsers = validCodes.filter(code => code.last_accessed).length;

  const headingFont = { fontFamily: "'Outfit', sans-serif" };
  const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div className="space-y-8" style={{ fontFamily: "'Figtree', sans-serif" }}>
      {/* KPI Strip */}
      <div className="bg-[#c9a84c] text-[#0d0d0d] px-6 py-2.5 flex flex-wrap gap-x-8 gap-y-1 justify-between items-center text-[10px] font-bold tracking-[0.2em] uppercase">
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <div className="flex items-center gap-2">
            <span>Total Codes</span>
            <span className="text-sm" style={monoFont}>{totalCodes}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Active</span>
            <span className="text-sm" style={monoFont}>{validCodes.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Active Users</span>
            <span className="text-sm" style={monoFont}>{activeUsers}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Problems Generated</span>
          <span className="text-sm" style={monoFont}>{totalProblems.toLocaleString()}</span>
        </div>
      </div>

      {/* Create Form */}
      <section className="bg-[#1a1a1a] p-5 border-l-2 border-[#c9a84c]">
        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-3 block">
          Create New Access Code
        </label>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Enter custom code..."
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#c9a84c]/20 rounded-none px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-[#c9a84c] text-white placeholder:text-gray-700"
              style={monoFont}
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              placeholder="Days"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#c9a84c]/20 rounded-none px-3 py-2 text-sm focus-visible:ring-0 focus-visible:border-[#c9a84c] text-white placeholder:text-gray-700"
            />
          </div>
          <button
            onClick={generateRandomCode}
            className="px-4 py-2 text-[10px] tracking-[0.2em] uppercase border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors inline-flex items-center gap-2 font-bold"
          >
            <Wand2 className="h-3 w-3" />
            Randomize
          </button>
          <button
            onClick={addAccessCode}
            className="px-6 py-2 text-[10px] tracking-[0.2em] uppercase bg-[#c9a84c] text-[#0d0d0d] hover:bg-[#f0d78c] transition-colors font-bold inline-flex items-center gap-2"
          >
            <Sparkles className="h-3 w-3" />
            Generate Code
          </button>
        </div>
      </section>

      {/* Active Codes Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#c9a84c]" style={headingFont}>
            Active Access Codes
            <span className="ml-2 text-gray-600 font-normal" style={monoFont}>
              [{validCodes.length}]
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto border border-[#1a1a1a]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="text-[10px] uppercase tracking-[0.15em] text-gray-500 bg-[#1a1a1a]/50">
              <tr>
                <th className="py-3 px-3 font-semibold">Code</th>
                <th className="py-3 px-3 font-semibold">닉네임 (표시 / 메모)</th>
                <th className="py-3 px-3 font-semibold">Expiration</th>
                <th className="py-3 px-3 font-semibold">Last Access</th>
                <th className="py-3 px-3 font-semibold text-right">Problems</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {validCodes.map((code) => {
                const isEditing = editingCodeId === code.code;
                return (
                  <tr
                    key={code.code}
                    className="border-t border-[#1a1a1a] hover:bg-[#c9a84c]/5 transition-colors"
                  >
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#f0d78c] font-medium tracking-wider" style={monoFont}>
                          {code.code}
                        </span>
                        <button
                          onClick={() => copyAccessCode(code.code)}
                          className="text-gray-600 hover:text-[#c9a84c] transition-colors"
                          title="복사"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-300">
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <Input
                            placeholder="닉네임 (헤더에 표시)"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-44 h-8 text-xs bg-[#0d0d0d] border-[#c9a84c]/30 rounded-none focus-visible:ring-0 focus-visible:border-[#c9a84c]"
                          />
                          <Input
                            placeholder="메모 (선택)"
                            value={editUserName}
                            onChange={(e) => setEditUserName(e.target.value)}
                            className="w-40 h-8 text-xs bg-[#0d0d0d] border-[#c9a84c]/30 rounded-none focus-visible:ring-0 focus-visible:border-[#c9a84c]"
                          />
                          <button
                            onClick={saveEdit}
                            className="p-1.5 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 text-gray-500 hover:bg-[#1a1a1a] transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(code)}
                            className="text-[#f0d78c] font-semibold hover:text-white hover:underline decoration-dotted underline-offset-4 transition-colors text-left"
                            title="클릭하여 닉네임 수정"
                          >
                            {code.name || "닉네임 없음"}
                          </button>
                          {code.user_name && (
                            <>
                              <span className="text-gray-600">·</span>
                              <button
                                onClick={() => startEdit(code)}
                                className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors"
                                title="클릭하여 수정"
                              >
                                {code.user_name}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => startEdit(code)}
                            className="ml-1 text-gray-600 hover:text-[#c9a84c] transition-colors"
                            title="닉네임 수정"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 text-gray-500" style={monoFont}>
                      {new Date(code.expiry_date).toLocaleDateString("en-CA")}
                    </td>
                    <td className="py-4 px-3 text-gray-500" style={monoFont}>
                      {code.last_accessed
                        ? new Date(code.last_accessed).toLocaleString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "—"}
                    </td>
                    <td className="py-4 px-3 text-right text-gray-300" style={monoFont}>
                      {(code.problem_count ?? 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-3 text-right space-x-4">
                      <button
                        onClick={() => handleExtendClick(code.code, code.expiry_date)}
                        className="text-[#c9a84c] hover:text-[#f0d78c] text-[10px] uppercase tracking-[0.15em] font-bold transition-colors"
                      >
                        Extend
                      </button>
                      <button
                        onClick={() => removeAccessCode(code.code)}
                        className="text-red-900/80 hover:text-red-500 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {validCodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-3 text-center text-gray-600 text-xs">
                    활성 코드가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Expired Codes */}
      {expiredCodes.length > 0 && (
        <section className="opacity-70">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4" style={headingFont}>
            Expired Codes
            <span className="ml-2 text-gray-700 font-normal" style={monoFont}>
              [{expiredCodes.length}]
            </span>
          </h2>
          <div className="space-y-1">
            {expiredCodes.map((code) => (
              <div
                key={code.code}
                className="bg-[#1a1a1a] px-4 py-3 text-[11px] flex items-center justify-between border border-transparent hover:border-[#c9a84c]/20 transition-colors"
              >
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-500">
                  <span className="text-[#f0d78c]/60 font-medium" style={monoFont}>
                    {code.code}
                  </span>
                  <span style={monoFont}>EXPIRED: {new Date(code.expiry_date).toLocaleDateString("en-CA")}</span>
                  <span>Problems: {code.problem_count ?? 0}</span>
                </div>
                <button
                  onClick={() => removeAccessCode(code.code)}
                  className="text-red-500/60 hover:text-red-500 text-[10px] uppercase tracking-[0.15em] font-bold transition-colors"
                >
                  Purge
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extension Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#0d0d0d] border border-[#c9a84c]/30 rounded-none shadow-2xl text-gray-300" style={{ fontFamily: "'Figtree', sans-serif" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base text-white uppercase tracking-[0.2em]" style={headingFont}>
              <Calendar className="h-4 w-4 text-[#c9a84c]" />
              유효기간 연장
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="p-3 bg-[#1a1a1a] border-l-2 border-[#c9a84c]/50 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">현재 만료일</span>
              <span className="text-sm text-[#f0d78c]" style={monoFont}>
                {selectedCode && new Date(selectedCode.expiry_date).toLocaleDateString("en-CA")}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500">연장 일수</label>
              <Input
                type="number"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
                placeholder="30"
                className="bg-[#0d0d0d] border border-[#c9a84c]/20 rounded-none focus-visible:ring-0 focus-visible:border-[#c9a84c] h-11 text-base text-white"
                style={monoFont}
              />
            </div>

            {extensionDays && !isNaN(parseInt(extensionDays)) && (
              <div className="p-3 bg-[#c9a84c]/10 border-l-2 border-[#c9a84c] flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#c9a84c]">새 만료일</span>
                <span className="text-sm text-[#f0d78c] font-bold" style={monoFont}>
                  {selectedCode && new Date(new Date(selectedCode.expiry_date).getTime() + parseInt(extensionDays) * 24 * 60 * 60 * 1000).toLocaleDateString("en-CA")}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsExtendDialogOpen(false)}
              className="px-5 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border border-[#1a1a1a] text-gray-400 hover:border-[#c9a84c]/30 hover:text-[#c9a84c] transition-colors"
            >
              취소
            </button>
            <button
              onClick={extendExpiry}
              className="px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#c9a84c] text-[#0d0d0d] hover:bg-[#f0d78c] transition-colors"
            >
              연장하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

