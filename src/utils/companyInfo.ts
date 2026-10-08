export interface CompanyInfo {
    name: string;
    shortName: string;
    taxCode: string;
    address: string;
    phone: string;
    email?: string;
    owner?: string;
    footerText: string;
    isHkd: boolean;
    brandColor: string;
    bankInfo?: {
        bankName: string;
        branch?: string;
        accountNumber: string;
        accountHolder: string;
        swiftCode?: string;
    };
}

export const getCompanyInfo = (overrideIsHkd?: boolean): CompanyInfo => {
    const isHkd = typeof overrideIsHkd === 'boolean' 
        ? overrideIsHkd 
        : (typeof window !== 'undefined' && (
            window.location.hostname === 'hkd.vgvina.com' ||
            window.location.hostname.includes('hkd')
        ));
    
    if (isHkd) {
        return {
            name: 'HỘ KINH DOANH TUỔI NGỌC',
            shortName: 'Tuổi Ngọc',
            taxCode: '051078010386',
            address: '270/1 Lương Định Của, Phường Tây Nha Trang, Tỉnh Khánh Hòa, Việt Nam',
            phone: '0905190888',
            owner: 'HUỲNH NGỌC HOÀNG',
            footerText: 'HKD TUỔI NGỌC',
            isHkd: true,
            brandColor: '#0066cc',
            bankInfo: {
                bankName: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
                branch: 'Chi nhánh Khánh Hòa',
                accountNumber: '8839483122',
                accountHolder: 'HO KINH DOANH TUOI NGOC',
                swiftCode: 'BIDVVNVX'
            }
        };
    }
    
    return {
        name: 'CÔNG TY CỔ PHẦN THỰC PHẨM ECO ORGANIC NHA TRANG',
        shortName: 'VGVINA',
        taxCode: '4201 907 902',
        address: 'Thôn Cát Lợi, Phường Bắc Nha Trang, Tỉnh Khánh Hòa, Việt Nam.',
        phone: '02583.511.179',
        email: 'ntecoorganicfoods@gmail.com',
        footerText: 'VGVINA',
        isHkd: false,
        brandColor: '#0066cc',
        bankInfo: {
            bankName: 'Techcombank CN Nha Trang',
            accountNumber: '19036334624019',
            accountHolder: 'Công Ty Cổ Phần Thực Phẩm Eco Organic Nha Trang'
        }
    };
};
