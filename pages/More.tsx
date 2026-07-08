import React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../types';
import { DonHangIcon, PieChartIcon, DoiTacIcon, DuplicateIcon, KhoIcon, ReturnIcon, AccountIcon, CategoryIcon, NguoiDungIcon, HistoryIcon, ArrowsUpDownIcon, DeleteIcon } from '../components/icons/Icons';
import FilterBar from '../components/ui/FilterBar';

interface ReportLinkProps {
    to?: string;
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    color: string;
}

const ReportLink: React.FC<ReportLinkProps> = ({ to, onClick, icon, label, color }) => {
    const content = (
        <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full p-2 ${color}`}>
                {icon}
            </div>
            <span className="mt-2 text-xs font-medium text-gray-700">{label}</span>
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }

    return <button onClick={onClick} className="w-full text-left">{content}</button>;
};

const More: React.FC = () => {
    const sections = [
        {
            title: 'Báo cáo',
            links: [
                { to: '/bao-cao/xuat-nhap', icon: <DonHangIcon />, label: 'Xuất/Nhập', color: 'bg-blue-100 text-blue-600' },
                { to: '/bao-cao/ban-hang-hang-hoa', icon: <DonHangIcon />, label: 'Bán hàng theo Hàng hóa', color: 'bg-green-100 text-green-600' },
                { to: '/bao-cao/ton-kho', icon: <KhoIcon />, label: 'Tồn kho', color: 'bg-orange-100 text-orange-600' },
                { to: '/bao-cao/xuat-nhap-ton', icon: <KhoIcon />, label: 'Tổng hợp Xuất Nhập Tồn', color: 'bg-teal-100 text-teal-600' },
                { to: '/bao-cao/chuyen-kho', icon: <ArrowsUpDownIcon className="w-full h-full" />, label: 'Chuyển Kho', color: 'bg-purple-100 text-purple-600' },
                { to: '/bao-cao/thu-chi-hang-muc', icon: <PieChartIcon className="w-full h-full" />, label: 'Thu chi theo Hạng mục', color: 'bg-green-100 text-green-600' },
                { to: '/bao-cao/thu-chi-doi-tuong', icon: <DoiTacIcon />, label: 'Thu chi theo Đối tượng', color: 'bg-purple-100 text-purple-600' },
                { to: '/bao-cao/so-chi-tiet-cong-no', icon: <DoiTacIcon />, label: 'Sổ chi tiết Công nợ', color: 'bg-cyan-100 text-cyan-600' },
                { to: '/bao-cao-cong-no', icon: <DoiTacIcon />, label: 'Báo cáo công nợ', color: 'bg-indigo-100 text-indigo-600' },
                { to: '/bao-cao/trung-lap', icon: <DuplicateIcon />, label: 'Báo cáo Trùng lặp', color: 'bg-yellow-100 text-yellow-600' },
                { to: '/bao-cao/tra-hang', icon: <ReturnIcon />, label: 'Báo cáo Trả Hàng', color: 'bg-red-100 text-red-600' },
                { to: '/bao-cao/huy-hang', icon: <DeleteIcon />, label: 'Báo cáo Hủy Hàng', color: 'bg-gray-200 text-gray-600' },
            ]
        },
        {
            title: 'Quản lý kho',
            links: [
                { to: '/bao-cao/ton-kho', icon: <KhoIcon />, label: Page.TonKho, color: 'bg-orange-100 text-orange-600' },
                { to: '/bao-cao/chuyen-kho', icon: <ArrowsUpDownIcon className="w-full h-full" />, label: 'Chuyển kho', color: 'bg-teal-100 text-teal-600' },
                { to: '/bao-cao/huy-hang', icon: <DeleteIcon />, label: 'Xuất hủy', color: 'bg-red-100 text-red-600' },
            ]
        },
        {
            title: 'Đối tác',
            links: [
                { to: '/doi-tac', icon: <DoiTacIcon />, label: 'Khách hàng & ncc', color: 'bg-indigo-100 text-indigo-600' },
            ]
        },
        {
            title: 'Quản trị',
            links: [
                { to: '/admin/tai-khoan', icon: <AccountIcon />, label: 'Tài khoản', color: 'bg-teal-100 text-teal-600' },
                { to: '/admin/hang-muc', icon: <CategoryIcon />, label: 'Hạng mục', color: 'bg-teal-100 text-teal-600' },
                { to: '/admin/doi-tuong', icon: <DoiTacIcon />, label: 'Đối tượng', color: 'bg-teal-100 text-teal-600' },
                { to: '/admin/thanh-vien', icon: <NguoiDungIcon />, label: 'Thành viên', color: 'bg-teal-100 text-teal-600' },
                { to: '/admin/history', icon: <HistoryIcon />, label: 'Lịch sử', color: 'bg-teal-100 text-teal-600' },
            ]
        }
    ];

    return (
        <>
            <FilterBar onSearch={() => { }} onTimeFilterChange={() => { }} pageTitle="Khác" />
            <div className="space-y-6">
                {sections.map(section => (
                    <div key={section.title} className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-base font-bold text-gray-800 mb-3">{section.title}</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {section.links.map(link => <ReportLink key={link.label} {...link} />)}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default More;