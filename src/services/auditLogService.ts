import { AuditLog } from '../../types';
import { supabase } from '../supabaseClient';

export const auditLogService = {
    async getAuditLogs(): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('vgvina_audit_logs')
            .select(`
                *,
                user:vgvina_users(id, username, full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(1000); // Limit to last 1000 logs for performance

        if (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }

        // Transform to match AuditLog type
        return (data || []).map(log => ({
            id: log.id,
            tableName: log.table_name,
            recordId: log.record_id,
            action: log.action as 'CREATE' | 'UPDATE' | 'DELETE',
            oldValues: log.old_values,
            newValues: log.new_values,
            userId: log.user_id,
            userName: log.user?.username || log.user?.full_name || 'Unknown',
            timestamp: log.created_at
        }));
    },

    async getLogsByRecordId(tableName: string, recordId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('vgvina_audit_logs')
            .select(`
                *,
                user:vgvina_users(id, username, full_name)
            `)
            .eq('table_name', tableName)
            .eq('record_id', recordId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching logs by record ID:', error);
            throw error;
        }

        return (data || []).map(log => ({
            id: log.id,
            tableName: log.table_name,
            recordId: log.record_id,
            action: log.action as 'CREATE' | 'UPDATE' | 'DELETE',
            oldValues: log.old_values,
            newValues: log.new_values,
            userId: log.user_id,
            userName: log.user?.username || log.user?.full_name || 'Unknown',
            timestamp: log.created_at
        }));
    },

    async createAuditLog(log: {
        tableName: string;
        recordId: string;
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        oldValues?: any;
        newValues?: any;
        userId?: number;
    }) {
        const { error } = await supabase
            .from('vgvina_audit_logs')
            .insert({
                table_name: log.tableName,
                record_id: log.recordId,
                action: log.action,
                old_values: log.oldValues,
                new_values: log.newValues,
                user_id: log.userId
            });

        if (error) {
            console.error('Error creating audit log:', error);
            throw error;
        }
    }
};
