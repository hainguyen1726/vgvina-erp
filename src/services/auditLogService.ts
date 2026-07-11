import { AuditLog } from '../../types';
import { supabase } from '../supabaseClient';

export const auditLogService = {
    async getAuditLogs(filters?: {
        user?: string;
        objectType?: string;
        action?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AuditLog[]> {
        let query = supabase
            .from('vgvina_audit_logs')
            .select(`
                *,
                user:vgvina_users(id, username, full_name)
            `);

        if (filters) {
            if (filters.objectType && filters.objectType !== 'all') {
                query = query.eq('table_name', filters.objectType);
            }
            if (filters.action && filters.action !== 'all') {
                query = query.eq('action', filters.action);
            }
            if (filters.user && filters.user !== 'all') {
                // Try parsing user as ID
                const userId = Number(filters.user);
                if (!isNaN(userId)) {
                    query = query.eq('user_id', userId);
                }
            }
            if (filters.dateFrom) {
                query = query.gte('created_at', `${filters.dateFrom}T00:00:00+07:00`);
            }
            if (filters.dateTo) {
                query = query.lte('created_at', `${filters.dateTo}T23:59:59+07:00`);
            }
        }

        const { data, error } = await query
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
