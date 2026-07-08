-- Auto-generated import script
-- Generated at 2026-01-27T11:51:37.134Z

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to find or create facility
CREATE OR REPLACE FUNCTION get_or_create_facility(p_name TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_facilities WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_facilities (name) VALUES (p_name) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for partners
CREATE OR REPLACE FUNCTION get_or_create_partner(p_name TEXT, p_type TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_partners WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_partners (name, type) VALUES (p_name, p_type) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for accounts
CREATE OR REPLACE FUNCTION get_or_create_account(p_name TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_accounts WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_accounts (name, type) VALUES (p_name, 'CASH') RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for categories
CREATE OR REPLACE FUNCTION get_or_create_txn_category(p_name TEXT, p_type TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_transaction_categories WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_transaction_categories (name, type) VALUES (p_name, p_type) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for product categories (simple approach: Default category if unknown)
CREATE OR REPLACE FUNCTION get_default_product_category() RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_product_categories WHERE name = 'General' LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_product_categories (name) VALUES ('General') RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for products
CREATE OR REPLACE FUNCTION get_or_create_product(p_code TEXT, p_name TEXT, p_unit TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_products WHERE sku = p_code LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_products (sku, name, unit, category_id) 
        VALUES (p_code, p_name, p_unit, get_default_product_category()) 
        RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

SELECT get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MTV SHIZEN FOOD', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TP NHẬT KOTO (MR KIÊN- HL)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH VẠN QUANG FOOD', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH PGF ASIA- HN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH PGF ASIA- SG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', 'CUSTOMER');
SELECT get_or_create_partner('CT GREENGOOD', 'CUSTOMER');
SELECT get_or_create_partner('MS GIANG- CẦN THƠ', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MEAT AND FISH', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', 'CUSTOMER');
SELECT get_or_create_partner('SUSHI O BA', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM TP SH (SH FOODS)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH DG GROUP (HARU - Q12)', 'CUSTOMER');
SELECT get_or_create_partner('MR ÁNH ECO-HN', 'CUSTOMER');
SELECT get_or_create_partner('NH QUẢNG NINH- CS2', 'CUSTOMER');
SELECT get_or_create_partner('MR THIỆU - NHA TRANG (CÁ NHÂN)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM DV ONE MOREANH (MR TUẤN NGHĨA- ĐÀ NẴNG)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH SAKURA SUSHI', 'CUSTOMER');
SELECT get_or_create_partner('GOFOOD- HN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH ĐẢO HẢI SẢN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TP TS SẠCH HÀ TĨNH (TRUNG-HÀ TĨNH)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM DV VINROLL VN ( MR PHÚC- THỦ ĐỨC)', 'CUSTOMER');
SELECT get_or_create_partner('CT CP TẬP ĐOÀN DU THUYỀN- NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('CT CP DV LƯƠNG NGUYÊN', 'CUSTOMER');
SELECT get_or_create_partner('MR BÌNH- HN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', 'CUSTOMER');
SELECT get_or_create_partner('CT CP DV TM HADU', 'CUSTOMER');
SELECT get_or_create_partner('MR MẠNH TOCHANSISHI', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', 'CUSTOMER');
SELECT get_or_create_partner('CN CT CP TM VÀ DV VIET DELI - NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH VIETART F&B', 'CUSTOMER');
SELECT get_or_create_partner('MR THỊNH- ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('HKD Y SA BI (MS GIA HÂN- TRÀ VINH)', 'CUSTOMER');
SELECT get_or_create_partner('MR THIÊN SS- NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH NEW FRESH FOODS', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH XNK SK FOODS VN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH DV TOTORO VN (MS HẰNG - ĐÀ NẴNG)', 'CUSTOMER');
SELECT get_or_create_partner('NH HS HÀM NINH GRANDWORLD PHÚ QUỐC', 'CUSTOMER');
SELECT get_or_create_partner('GOFOOD-SG (CT TNHH FBC SÀI GÒN)', 'CUSTOMER');
SELECT get_or_create_partner('MR THỦY- NGHỆ AN (FUJIMO)', 'CUSTOMER');
SELECT get_or_create_partner('NH UNI SUSHI', 'CUSTOMER');
SELECT get_or_create_partner('NH BABABA-PHÚ QUỐC', 'CUSTOMER');
SELECT get_or_create_partner('CT CP QL KS VÀ KND LYNN TIMES (MR ĐINH ĐỒNG)', 'CUSTOMER');
SELECT get_or_create_partner('MR LEE - PHÚ QUỐC', 'CUSTOMER');
SELECT get_or_create_partner('MR TOÀN - ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('MS NGỌC ANH- ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('MR ĐỊNH- NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', 'CUSTOMER');
SELECT get_or_create_partner('MR TRẦN THANH HOÀN- ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('MR QUÝ - ĐỒNG NAI', 'CUSTOMER');
SELECT get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', 'CUSTOMER');
SELECT get_or_create_partner('NH QUẢNG NINH-CS1', 'CUSTOMER');
SELECT get_or_create_partner('MR RI SISHI (MR PHÚC SUSHI)', 'CUSTOMER');
SELECT get_or_create_partner('MR HIỆP- BẮC GIANG', 'CUSTOMER');
SELECT get_or_create_partner('NH TAKO IKA- SG', 'CUSTOMER');
SELECT get_or_create_partner('BÀ MINH- HÀ TĨNH', 'CUSTOMER');
SELECT get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', 'CUSTOMER');
SELECT get_or_create_partner('SS GARDEN NGUYỄN TRÃI', 'CUSTOMER');
SELECT get_or_create_partner('NH DASUSHI- NVL', 'CUSTOMER');
SELECT get_or_create_partner('NH QUẢNG NINH-CS3', 'CUSTOMER');
SELECT get_or_create_partner('MR NHÂN SS- 290 KIM MÃ, HN', 'CUSTOMER');
SELECT get_or_create_partner('MR HIẾU- VŨNG TÀU', 'CUSTOMER');
SELECT get_or_create_partner('CT MADISON LAND HỒ TRÀM', 'CUSTOMER');
SELECT get_or_create_partner('MR TÂN- HẢI PHÒNG', 'CUSTOMER');
SELECT get_or_create_partner('NAKED FOODS QUẬN 1', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM VÀ DV ATABLE VN', 'CUSTOMER');
SELECT get_or_create_partner('CT LÊ GiA (MINORI CS2)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH GOLDEN FINE FOODS', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH SANMARU (MR NGỌC- HN)', 'CUSTOMER');
SELECT get_or_create_partner('AKIKO SUSHI - SG', 'CUSTOMER');
SELECT get_or_create_partner('MS TUYỀN- THỦ ĐỨC', 'CUSTOMER');
SELECT get_or_create_partner('HÀ DƯƠNG FOODS- SG', 'CUSTOMER');
SELECT get_or_create_partner('MR HẠNH- BẮC NINH', 'CUSTOMER');
SELECT get_or_create_partner('NAKED FOODS QUẬN 3', 'CUSTOMER');
SELECT get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('HANA SS- THÁI BÌNH', 'CUSTOMER');
SELECT get_or_create_partner('MR TIẾN QUẢNG TRỊ', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM DV HAN YANG', 'CUSTOMER');
SELECT get_or_create_partner('MS HỒNG- CHỢ MỚI LONG THÀNH ĐỒNG NAI', 'CUSTOMER');
SELECT get_or_create_partner('MS HUẾ- SG (CT CÀ PHÊ HOÀNG TRUNG)', 'CUSTOMER');
SELECT get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('MS DƯƠNG MINH LÝ- QUẢNG NINH', 'CUSTOMER');
SELECT get_or_create_partner('MR GIANG- VẠN GIÃ', 'CUSTOMER');
SELECT get_or_create_partner('MS HUẾ- SG (ANH TRUNG- DAKNONG)', 'CUSTOMER');
SELECT get_or_create_partner('SS IKUSACHI- SG', 'CUSTOMER');
SELECT get_or_create_partner('SS GARDEN- NGUYỄN VĂN LỘC', 'CUSTOMER');
SELECT get_or_create_partner('MR LEE MINH HEO - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR TUÂN - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR THUẬN- SG (NOWZOON)', 'CUSTOMER');
SELECT get_or_create_partner('MR TRẦN HOÀNG- SG', 'CUSTOMER');
SELECT get_or_create_partner('MR ĐẠI- NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('NH YAKI YUM - NGUYỄN VĂN LỘC', 'CUSTOMER');
SELECT get_or_create_partner('Mr Hoàn BGD', 'CUSTOMER');
SELECT get_or_create_partner('MR LƯỢNG - BẮC NINH', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', 'CUSTOMER');
SELECT get_or_create_partner('MS LÌ - SÀI GÒN', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH SX-TM THIÊN ÂN PHÁT (MR ĐỖ XUÂN-NT)', 'CUSTOMER');
SELECT get_or_create_partner('MR TRƯỜNG SSM - PY', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', 'CUSTOMER');
SELECT get_or_create_partner('CT LIÊN VIỆT', 'CUSTOMER');
SELECT get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', 'CUSTOMER');
SELECT get_or_create_partner('MR VÕ CẢNH-HCM', 'CUSTOMER');
SELECT get_or_create_partner('NH KYOBASHI IZAKAYA- SG', 'CUSTOMER');
SELECT get_or_create_partner('NH SUSHI MINH - SG', 'CUSTOMER');
SELECT get_or_create_partner('CT MARUSEI - SG', 'CUSTOMER');
SELECT get_or_create_partner('MR HOÀNG - NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('MR DUY - VĂN CAO, HN', 'CUSTOMER');
SELECT get_or_create_partner('MR TRÌNH - SG', 'CUSTOMER');
SELECT get_or_create_partner('MS THANH THẢO- SG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH XK & NK AN PHÚ (HSX 55 MỄ TRÌ)', 'CUSTOMER');
SELECT get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', 'CUSTOMER');
SELECT get_or_create_partner('CT 138 ENT (LẨU CÁ THANH ĐA) - SG', 'CUSTOMER');
SELECT get_or_create_partner('ANH LỘC - ĐÔNG NAI', 'CUSTOMER');
SELECT get_or_create_partner('NH NAGI 2 - GÒ VẤP', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MTV ISHIGA (PHIPHI SS)- ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH KAKINOKI (MS PHƯƠNG -SG)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MEAT FARM', 'CUSTOMER');
SELECT get_or_create_partner('CHEF HỒNG - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR THÊU - HN -CS2', 'CUSTOMER');
SELECT get_or_create_partner('MS TRINH- QUẬN 7', 'CUSTOMER');
SELECT get_or_create_partner('ANH TIÊN - CẦN THƠ', 'CUSTOMER');
SELECT get_or_create_partner('MR BÙI DANH - SG', 'CUSTOMER');
SELECT get_or_create_partner('CT MOO JIN (MS HỒNG ÁNH - SG)', 'CUSTOMER');
SELECT get_or_create_partner('MR THÁI - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR HẢI- HN', 'CUSTOMER');
SELECT get_or_create_partner('CT MARUSEI - HN', 'CUSTOMER');
SELECT get_or_create_partner('MS NGỢI - ECO', 'CUSTOMER');
SELECT get_or_create_partner('MR TRIỆT - TÂY NINH', 'CUSTOMER');
SELECT get_or_create_partner('MR HỢP - ĐÀ NẴNG', 'CUSTOMER');
SELECT get_or_create_partner('MITSUBITSHI - HN', 'CUSTOMER');
SELECT get_or_create_partner('CT ANH VŨ - HN (C HƯƠNG)', 'CUSTOMER');
SELECT get_or_create_partner('MR HẢI TRIỀU - Q10 - SG', 'CUSTOMER');
SELECT get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', 'CUSTOMER');
SELECT get_or_create_partner('MR HUY - YERSIN - NT', 'CUSTOMER');
SELECT get_or_create_partner('QUÁN ỐC 88 - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR LONG - CẦU GIẤY - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR HIẾU - HN (61 BÁT SỨ)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MTV ĐẠI VY (NH MAYONAKA)', 'CUSTOMER');
SELECT get_or_create_partner('CT KYOTO YAKINIKU - A CHÂU - DN', 'CUSTOMER');
SELECT get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', 'CUSTOMER');
SELECT get_or_create_partner('MS GIANG - 54 VŨ HUY TÂN - HN', 'CUSTOMER');
SELECT get_or_create_partner('MS CHÂU TO - SG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH KIWAMI VN - MR TUẤN - NT', 'CUSTOMER');
SELECT get_or_create_partner('MR TRẦN QUỐC Ý - NT', 'CUSTOMER');
SELECT get_or_create_partner('QUÁN TANAKEI - SG', 'CUSTOMER');
SELECT get_or_create_partner('KIN SUSHI - LÂM ĐỒNG', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH SƠN BA (MR THÀNH VIN)', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH MTV TM NAM ANH FOODS (MR VINH- ĐÀ NẴNG)', 'CUSTOMER');
SELECT get_or_create_partner('MR QUANG THẤT - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR HOÀNG VŨ - SG', 'CUSTOMER');
SELECT get_or_create_partner('MS LAN - NT', 'CUSTOMER');
SELECT get_or_create_partner('KHÁCH LẺ', 'CUSTOMER');
SELECT get_or_create_partner('MR ĐÔ - SG', 'CUSTOMER');
SELECT get_or_create_partner('MS HUYỀN TRANG - NT', 'CUSTOMER');
SELECT get_or_create_partner('CT MARUSEI - ĐN', 'CUSTOMER');
SELECT get_or_create_partner('NH HÀN QUỐC OMAKASE', 'CUSTOMER');
SELECT get_or_create_partner('MR LONG - THỊNH LIỆT - HN', 'CUSTOMER');
SELECT get_or_create_partner('KIM THẢO - PY', 'CUSTOMER');
SELECT get_or_create_partner('CN DNTN XD LONG PHƯỚC (MR CHÁNH-VT)', 'CUSTOMER');
SELECT get_or_create_partner('HÂY SUSHI - CẦN THƠ', 'CUSTOMER');
SELECT get_or_create_partner('NH MAXI - NHA TRANG', 'CUSTOMER');
SELECT get_or_create_partner('MS ĐÌNH PHONG - HN', 'CUSTOMER');
SELECT get_or_create_partner('MS THỦY TIÊN - HN', 'CUSTOMER');
SELECT get_or_create_partner('BIG SUSHI - LÊ NHÃ - ĐN', 'CUSTOMER');
SELECT get_or_create_partner('MR NGUYỄN ANH - LINH ĐÀM - HN', 'CUSTOMER');
SELECT get_or_create_partner('MR TRƯỜNG - SG', 'CUSTOMER');
SELECT get_or_create_partner('MS LINH - HN', 'CUSTOMER');
SELECT get_or_create_partner('DOAN TAM KICCHOU - HN', 'CUSTOMER');
SELECT get_or_create_partner('FAMILY SUSHI  - QNAM', 'CUSTOMER');
SELECT get_or_create_partner('MR QUỐC HOÀN - HN', 'CUSTOMER');
SELECT get_or_create_partner('MS THƠM - NT', 'CUSTOMER');
SELECT get_or_create_partner('CT TNHH TM DV VÀ TP PHƯƠNG LINH', 'CUSTOMER');
SELECT get_or_create_partner('CT ĐÔNG PHƯƠNG', 'CUSTOMER');
SELECT get_or_create_partner('MR NHẬT TRẦN - HN', 'CUSTOMER');
SELECT get_or_create_partner('NCC CHẢ CÁ - CHỊ NGOAN - BÉ TÂN', 'SUPPLIER');
SELECT get_or_create_partner('NCC BT - TRẦN THỊ VI MÂN', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM - ĐẶNG - LÝ SƠN', 'SUPPLIER');
SELECT get_or_create_partner('NCC VẸM ĐEN - LÊ CÔNG', 'SUPPLIER');
SELECT get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', 'SUPPLIER');
SELECT get_or_create_partner('CÔNG TY TNHH EBT SÀI GÒN', 'SUPPLIER');
SELECT get_or_create_partner('CT VIỆT ORGANIC - TAM QUAN', 'SUPPLIER');
SELECT get_or_create_partner('NCC LƯỜN KIẾM - CHỊ PHƯƠNG DUNG - PY', 'SUPPLIER');
SELECT get_or_create_partner('NCC VÕ THỊ Ý - TAM QUAN', 'SUPPLIER');
SELECT get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', 'SUPPLIER');
SELECT get_or_create_partner('CT HẢI SẢN LINH LINH', 'SUPPLIER');
SELECT get_or_create_partner('CT HOÀN TRUYỀN', 'SUPPLIER');
SELECT get_or_create_partner('NCC BT - CHỊ NGA - PY', 'SUPPLIER');
SELECT get_or_create_partner('NCC BT - CHỊ SĨ - LÝ SƠN', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHỊ NGÂN - HÒN XỆN', 'SUPPLIER');
SELECT get_or_create_partner('NCC VẸM - DŨNG  - CR', 'SUPPLIER');
SELECT get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', 'SUPPLIER');
SELECT get_or_create_partner('NCC MR TRƯỜNG SSM - PY ', 'SUPPLIER');
SELECT get_or_create_partner('NCC MARUSEI- ĐÀ NẴNG', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM - SON - NINH HÒA', 'SUPPLIER');
SELECT get_or_create_partner('NCC KIM DUNG - NINH HÒA', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', 'SUPPLIER');
SELECT get_or_create_partner('NCC NGUYỄN THỊ THU - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', 'SUPPLIER');
SELECT get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', 'SUPPLIER');
SELECT get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHỊ HỒNG CHÂU - HÒN RỚ', 'SUPPLIER');
SELECT get_or_create_partner('NCC THIỆU - CHỊ TÂM ', 'SUPPLIER');
SELECT get_or_create_partner('TỪ SẢN XUẤT', 'SUPPLIER');
SELECT get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', 'SUPPLIER');
SELECT get_or_create_partner('NCC NHUM - ĐỖ THỊ ÁNH - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', 'SUPPLIER');
SELECT get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', 'SUPPLIER');
SELECT get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('NCC LỢI THU - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('NCC VÕ THỊ THẮM - PHÚ QUÝ', 'SUPPLIER');
SELECT get_or_create_partner('NCC TRẦN THỊ ÚT - PHÚ YÊN', 'SUPPLIER');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000284', 'Tôm Thẻ Lột', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000151', 'Loin lườn kiếm', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP0000131', 'Mực Nang Lớn', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000089', 'Bạch tuộc tươi size 0.5-1kg', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('NHUMVUN', 'Nhum vụn', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000159', 'Rẻo cá cờ kiếm', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000040', 'Bạch Tuộc Tako nhỏ', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000128', 'sụn xương cá kiếm', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP0000236', 'Cá Tai', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000024', 'Tuna loin tươi', 'kg');
SELECT get_or_create_product('SP0000024', 'Tuna loin tươi', 'kg');
SELECT get_or_create_product('SP0000024', 'Tuna loin tươi', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000279', 'Ngao Bộp Tím nguyên con', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP0000236', 'Cá Tai', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP0000131', 'Mực nang lớn', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000045', 'Bạch tuộc tươi size 1.5-2kg', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000024', 'Tuna loin tươi', 'kg');
SELECT get_or_create_product('SP000057', 'Kiếm Nguyên Con', 'kg');
SELECT get_or_create_product('SP0000024', 'Tuna loin tươi', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000271', 'Trứng nhum tươi', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000128', 'sụn xương cá kiếm', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000284', 'Tôm Thẻ Lột', 'kg');
SELECT get_or_create_product('SP000279', 'Ngao Bộp Tím nguyên con', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000089', 'Bạch tuộc tươi size 0.5-1kg', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000300', 'VAT', 'lần');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000300', 'VAT', 'lần');
SELECT get_or_create_product('SP000151', 'Loin lườn kiếm', 'kg');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000004', 'Tuna Saku', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000012', 'Lườn kiếm nướng', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000184', 'Sò Lông NL', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000040', 'Bạch Tuộc Tako nhỏ', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000081', 'Râu Tako A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000151', 'Loin lườn kiếm', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('NHUMVUN', 'Nhum vụn', 'kg');
SELECT get_or_create_product('SP000033', 'Lườn tuna', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000151', 'Loin lườn kiếm', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000022', 'Tuna đầu đuôi portion', 'kg');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000154', 'Bạch tuộc tako slice (160 gram/khay)', 'Khay');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000279', 'Ngao Bộp Tím nguyên con', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000097', 'Tuna Saku 3A', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000045', 'Bạch tuộc tươi size 1.5-2kg', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000166', 'Sushi mực ống 8g', 'khay');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000108', 'Cá Chim Vây Vàng', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000075', 'Mùn Cưa', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000285', 'Râu bạch tuộc tươi 150g up', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000265', 'Bạch tuộc mini 8-13', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000154', 'Bạch tuộc tako slice (160 gram/khay)', 'Khay');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP0000083', 'Nhum nguyên liệu (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000045', 'Bạch tuộc tươi size 1.5-2kg', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000142', 'Mực nang nút 9-10', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000279', 'Ngao Bộp Tím nguyên con', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('NHUMVUN', 'Nhum vụn', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000271', 'Trứng nhum tươi', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000142', 'Mực nang nút 9-10', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000040', 'Bạch Tuộc Tako nhỏ', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000273', 'Mực Ống SS khay 200g', 'khay');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000053', 'Kiếm vỉ nướng', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000081', 'Râu Tako A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000300', 'VAT', 'lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000081', 'Râu Tako A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000128', 'sụn xương cá kiếm', 'kg');
SELECT get_or_create_product('SP000033', 'Lườn tuna', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000154', 'Bạch tuộc tako slice (160 gram/khay)', 'Khay');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000035', 'Phí Vận Chuyển', 'Lần');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000284', 'Tôm Thẻ Lột', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000128', 'sụn xương cá kiếm', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000226', 'Tuna Saku XK', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000155', 'Xương cá cờ kiếm', 'kg');
SELECT get_or_create_product('SP000128', 'sụn xương cá kiếm', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000053', 'Kiếm vỉ nướng', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000012', 'Lườn kiếm nướng', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000056', 'Bào Ngư', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000081', 'Râu Tako A', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000040', 'Bạch Tuộc Tako nhỏ', 'kg');
SELECT get_or_create_product('SP000053', 'Kiếm vỉ nướng', 'kg');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000282', 'Bánh Takoyaki', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000020', 'Tuna rẻo CO', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000056', 'Bào Ngư', 'kg');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000102', 'Loin kiếm', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000283', 'Tôm Thẻ', 'kg');
SELECT get_or_create_product('SP000284', 'Tôm Thẻ Lột', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000176', 'Bạch tuộc LSNC 30-50', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000137', 'Tako mix', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000040', 'Bạch Tuộc Tako nhỏ', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000005', 'tuna steak', 'kg');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000007', 'Trứng nhum AB 200g/khay', 'kg');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000077', 'Mực Nang sushi Sashimi (160g/ khay)', 'khay');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000007-01', 'Trứng nhum AA 100g/khay', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000159', 'Rẻo cá cờ kiếm', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP0000236', 'Cá tai', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP000154', 'Bạch tuộc tako slice (160 gram/khay)', 'Khay');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000020', 'Tuna rẻo CO', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000008', 'Râu bạch tuộc', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000227', 'Trứng Nhum AA 200g/khay', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000118', 'chả cá hấp', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000289', 'Sò Lông Nửa Mảnh', 'kg');
SELECT get_or_create_product('SP000058', 'Hải Sâm', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000268', 'Trứng Nhum Gai khay 200g', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000142', 'Mực nang nút 9-10', 'kg');
SELECT get_or_create_product('SP000069', 'Cá Cờ Kiếm Saku', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000006', 'Nang roll', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000001', 'Bạch tuộc tako', 'kg');
SELECT get_or_create_product('SP000073', 'Vẹm Xanh Tách Vỏ ( PE)', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('SP000022', 'Tuna đầu đuôi portion', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000050', 'Tuna Saku A', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000011', 'Lườn kiếm sashimi', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000252', 'Chả Cá Viên', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000160', 'Phí gia công', 'kg');
SELECT get_or_create_product('SP000009-1', 'Tuna loin 5up', 'kg');
SELECT get_or_create_product('SP000009-2', 'Tuna loin 3-5', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000004', 'tuna saku', 'kg');
SELECT get_or_create_product('HAUHYOGO-M', 'Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000041', 'Kiếm steak', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000079', 'Mực Ống', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000184', 'Sò Lông nguyên liệu', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP0000224', 'Mực Nang 500-800', 'kg');
SELECT get_or_create_product('SP000142', 'Mực nang nút 9-10', 'kg');
SELECT get_or_create_product('SP000086', 'Mực Nang sushi Sashimi đông khay (200g/ khay)', 'Khay');
SELECT get_or_create_product('SP0000100', 'Nhum hũ', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000095', 'Nhum nguyên con (đvt: con)', 'con');
SELECT get_or_create_product('SP000035', 'phí vận chuyển', 'Lần');
SELECT get_or_create_product('SP0000236', 'Cá tai', 'kg');
SELECT get_or_create_product('SP000188', 'Cá Bè (Cá Khế, Cá Giấy, cá viễn)', 'kg');
SELECT get_or_create_product('SP0000121', 'Cá Hồng Biển', 'kg');
SELECT get_or_create_product('SP000010', 'Chả cá', 'kg');
SELECT get_or_create_product('SP000252', 'Chả Cá Viên', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('SP000094', 'Bạch tuộc tươi size 1up', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');
SELECT get_or_create_product('sp000002-1', 'Bạch tuộc tươi (hàng đỏ)', 'kg');
SELECT get_or_create_product('SP000002', 'Bạch tuộc tươi', 'kg');

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-10 23:54:00',
        4550000,
        'Anh Hoàng Vũ thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251108-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        2485896,
        'Thanh toán tiền nước T10,2025',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        1000000,
        'Mr Hoàn gửi phong bì cho bên thôn Cát Lợi: Đại hội chi bộ.  Mua mì tôm gạo tặng người nghèo',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        250,
        'Gửi 1 thùng tài thắng cho Phương HN',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        240,
        'Mua 2 bình nhớt cho máy hck',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        500,
        'Gửi 2 thùng cho vạn quang phú quốc',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        150,
        'Gửi 1 thùng cho vạn quang vĩnh long',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        500,
        'Gửi 5 thùng cho DPN',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251107-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-10 23:54:00',
        1745625,
        'CT TNHH KIWAMI VIET NAM chuyen tien thanh toan công nợ hd 1166',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251107-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-10 23:54:00',
        10711000,
        'CK trả lại tiền dư công nợ T10 của DPN (đã unc qua tk công ty)',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251107-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-10 23:54:00',
        73280000,
        'Go Food ck trả (do mình nhờ xuất hóa đơn, xong unc qua tk công ty cho họ), họ ck trả tk cá nhân (HĐ 156:  339.444.000, mình mới unc 89,444,000 vnđ, họ trừ vat hết hóa đơn: 16,164,000 còn lại ck mình 73,280,000)',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251107-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-10 23:54:00',
        4160000,
        'KS Mường Thanh thanh toán công nợ bill 7/11',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251107-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        75,
        'Mua đồ đơm',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        5750000,
        'Anh Việt ST thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        5750000,
        'TT công nợ chả cá Trí',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        2520000,
        'Family thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        2520000,
        'TT công nợ chả cá Trí',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        6350000,
        'Ngọc Anh ĐN thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        6350000,
        'TT công nợ chả cá Trí',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        345,
        'Mua 15 bao đá bi',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        2744500,
        'chị Hằng totoro DN thanh toán công nợ phần cá nhân',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        2744500,
        'TT công nợ chả cá Trí',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        11213500,
        'TP ngày mới thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        11213500,
        'TT công nợ chị Bé tân',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        750,
        'Gửi 3 thùng xe cont cho Phương HN',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        450,
        'Gửi 1 thùng cho Vạn quang phú quốc + 1 thùng cho baba phú quốc',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251106-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        1830000,
        'thanh toan hoa don 2901 cho cty DL Phuong Nam',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        19515000,
        'thanh toan tien mua nhum cho Nguyen Thi Dang tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        18740925,
        'VinRoll ck tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        2602950,
        'VU THI HUONG chuyen tien cs1 tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        9056250,
        'VU THI HUONG chuyen tien cs2 tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        1680000,
        'Sơn Ba thanh toán công nợ bill 3/11',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251106-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-10 23:54:00',
        25840000,
        'TT công nợ chị PHúc',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251106-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        2260000,
        'Anh Thêu thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251106-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        3300000,
        'Doan Tam thanh toán công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251106-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        2730000,
        'Anh hùng mai hắc đế tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251106-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-10 23:54:00',
        1961000,
        'Hana sushi thái bình tt công nợ',
        NULL,
        get_or_create_partner(NULL, CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251106-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        210,
        'Mua đồ cúng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        2000000,
        'Dự án nhum: phong bì đưa thầy',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        250,
        'Dự án nhum: Mua đồ cúng',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        140000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        1120000,
        'Nhận 4t nang của HS linh linh gửi + 2t kiếm tươi của Thúy bãi Vũ Mập',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        1198000,
        'Hoàn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        4219000,
        'Sơn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        1509000,
        'Sa',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        3265000,
        'Trang  trả lại lương dư',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        1601000,
        'Mỹ Hiền ck trả lại lương dư',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7417000,
        'Lệ',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        3227000,
        'Phương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        12870000,
        'Trâm Anh',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        5000000,
        'Cơ động',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        11151250,
        'Trung',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        8500000,
        'Duyên (ck 3tr còn tiền mặt)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6733000,
        'Ly (ck 3tr còn tiền mặt)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6875000,
        'Lý',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        2613000,
        'Vương ck trả lại lương dư',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7000000,
        'Khang',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7625000,
        'Thiện Chí',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        4625000,
        'Dư',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7434000,
        'Thảo',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6755000,
        'Phượng',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6636000,
        'Hiền',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7146000,
        'Nở',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        7739000,
        'Luyến',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        4696000,
        'Thủy',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6340000,
        'Thy',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        3138000,
        'Bình',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        8699000,
        'Tuấn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        273,
        'Phí vckv hn từ 21-31/10 (sau khi trừ tiền mặt Phương thu của khách Quốc Hoàn, Thủy Tiên, chị Linh HN)',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        1509000,
        'Phí vckv SG từ 14-31/10 (sau khi trừ 711k bên file thu chi Lệ)',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        10092000,
        'Thu tiền mặt công nợ T9 của Du Thuyền',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT CP TẬP ĐOÀN DU THUYỀN- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        1705000,
        'Dự án nhum: Tiền thầy mua lễ cúng',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        350,
        'Thanh toán tiền Grab A Trãi 5 đơn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        200,
        'Thanh toán phí vận chuyển loin ngừ tươi Ý gửi từ bến xe hà nội đến nơi cho khách',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        350,
        'Mua 01 quạt cây cho văn phòng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        700,
        'Gửi 7 thùng cho Ocean Link',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        100,
        'Gửi 1 thùng cho Marusei DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251105-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        370796355,
        'DPN THANH TOAN ECO HD SO 1086 THANG 10 2025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        384433259,
        'DPN THANH TOAN ECO HD SO 1144 1145 THANG 10 2025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        140000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        2722845,
        'NGUYEN DAO PHUONG LINH chuyen tien công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM DV VÀ TP PHƯƠNG LINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        58225440,
        'thanh toan hoa don 599 cho cty HS Linh Linh TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT HẢI SẢN LINH LINH', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10925000,
        'Hoàn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10601250,
        'Sơn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10601250,
        'Sa',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10601250,
        'Trang',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10601250,
        'Mỹ Hiền',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10601250,
        'Ngợi',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10082019,
        'Phương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        10082019,
        'Vương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        12257326,
        'sushi tiger thanh toan cong no SAKA NA thang 10 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        23667000,
        'Marusei thanh toan Eco HD 1094, 1107, 1137 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT MARUSEI - ĐN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        2047500,
        'CONG TY TNHH DAU TU NTP TT CA NGU 2 810 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251105-057'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        711,
        'Thanh toán phí ship kvsg 15-31/10/2025 (còn lại Trang ck thêm: 2220k-711k= 1,509,000)',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251105-058'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        30845000,
        'Green Good thanh toán công nợ t10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251105-059'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        95,
        'Sơn mua thêm dây thép chống bão',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251105-060'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        23203000,
        'TT công nợ bt a Tới phú quý',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251105-061'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        948.672,
        'CT TNHH TISM & CO ( MR NAM- Nguyễn Văn Ngọc) tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251105-062'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        3900000,
        'Chị Trinh q7 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251105-063'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-10 23:54:00',
        412,
        'Ngợi trả lại phần lương dư',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251105-064'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-10 23:54:00',
        6770000,
        'Dự án nhum: thanh toán tiền mua nhum con + cá bò hòm: 1095*6+5*40',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251105-065'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        260,
        'Thanh toán tiền internet kvHN t10,2025',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        2750000,
        'Nhận 7 thùng tuna loin tươi Ý gửi + 2thùng kiếm + 4t loin tươi Thúy gửi + tiền bãi Vũ Mập',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-10 23:54:00',
        6350000,
        'A Toàn đà nẵng thanh toán công nợ ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TOÀN - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        6350000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-10 23:54:00',
        2750000,
        'Mr Trường SG (Ông Thọ) thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRƯỜNG - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        2750000,
        'TT công nợ chả Cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        500,
        'Gửi 2 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        320,
        'Tiền thu gom rác 32 bao',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        100,
        'Gửi 1 thùng cho chị Giang cần thơ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        1000000,
        'Gửi 9t cho DPN + 1t anh Nhân + 1t Anh Nghĩa ĐN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251104-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        22402932,
        'Cong ty co phan thuc pham eco organic nha trang PQ09000856784 thanh toan tien dien ky thang 10.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251104-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        21909735,
        'Cong ty co phan thuc pham eco organic nha trang PQ09000853144 thanh toan tien dien ky thang  10.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251104-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        202,
        'Cty CP TP ECO ORGANIC NT KHA-01-0037650 THANH TOAN CUOC PHI internet va dt ban THANG 10.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251104-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        13760000,
        'cong ty co phan thuc pham eco organic nha trang TZ1158Z nop tien bhxh thang 10.2025',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251104-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        2757200,
        'Tạm ứng lương Mr Hoàn tháng 10 (thanh toán tiền vé máy bay Trần Thị Linh cho cty Bảo Gia Trần)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251104-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-10 23:54:00',
        2035000,
        'Anh Đông phú quốc thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251104-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-10 23:54:00',
        373,
        'Mua ống nước + dây thép cho xưởng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251104-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-10 23:54:00',
        2600000,
        'Ms Lì thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS LÌ - SÀI GÒN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251104-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        116,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        100000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        65000000,
        'TT công nợ chị Phạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        36,
        'Phí ngân hàng gửi tiền cho chị Lợi',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        22800000,
        'TT công nợ nhận 2 thùng nhum cô Thủy',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        1420000,
        'Nhận 3 thùng kiếm + 3 thùng loin ngừ tươi Thúy tam quan gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        2500000,
        'Đưa tiền đi chợ cho cô Dư tuần tiếp',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        3705000,
        'Uni Sushi thanh toán công nợ đến hết 1/11',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        3705000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        1880000,
        'Ms Thủy Tiên thanh toán công nợ bill phú quốc',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THỦY TIÊN - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        1880000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        2280000,
        'Anh Giang ninh hòa thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR GIANG- VẠN GIÃ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        2280000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        1488000,
        'Anh Thuận thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THUẬN- SG (NOWZOON)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        1488000,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        3986500,
        'NBQN cs3 thanh toán công nợ T9',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH QUẢNG NINH-CS3', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        3986500,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        250,
        'Gửi 1 thùng tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        80,
        'Xăng xe máy',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        750,
        'Gửi 3 thùng phú quốc cho Vạn Quang',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        800,
        'Đổ xăng xe tải',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        200,
        'Gửi 2 thùng BXMD cho MEat',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        150,
        'Gửi 1 thùng cho DPN + 1 thùng cho VietArt',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        350,
        'Mua đá khô',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        70,
        'Nhận 1 thùng rong (Dự án Nhum)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        500,
        'Gửi 3 thùng cho Vạn quang vĩnh long (có 1 thùng lớn)',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        1200000,
        'Nhận 8 thùng BT chị Thông phú quý gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251103-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        70179840,
        'CTY DONG PHUONG TRA ECO ORGANIC NHA TRANG HDMB EO-DP16 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT ĐÔNG PHƯƠNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251103-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        25306950,
        'Baba phú quốc thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251103-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        1600000,
        'Cty Sonba ck trung nhum công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SƠN BA (MR THÀNH VIN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251103-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        128,
        'Cty Sonba ck trung nhum công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SƠN BA (MR THÀNH VIN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251103-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        2402400,
        'Mr Hải thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251103-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-10 23:54:00',
        1224000,
        'Thanh toán điện nước cửa hàng HN tháng 10/2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251103-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        1023500,
        'Mr Nhật Trần thanh toán công nợ bill 3/11',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR NHẬT TRẦN - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251103-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        5325000,
        'Anh Hợp thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251103-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        300,
        'Baba PQ thanh toán tiền vận chuyển công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251103-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        4777000,
        'Mai Trinh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251103-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        3529000,
        'Anh Tân hải phòng thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TÂN- HẢI PHÒNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251103-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-10 23:54:00',
        1800000,
        '81/2 Hoàng Diệu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251103-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        1150000,
        'Gửi 1 thùng cho Thủy Tiên PQ  + 4t cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251102-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        500,
        'Gửi 2 thùng xe cont cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251102-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        350,
        'Nhận 2 thùng bt do a Tới phú quý gửi + xe ba gác a Ngọ chở từ xe về xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251102-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        200,
        'Gửi 2 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251102-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        100000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251102-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-10 23:54:00',
        36631.00034722222,
        'Góp cổ phần dự án nhum: Thanh toán tiền mua nhum con của cô Mai: 410 con * 6,5k + tiền mua sò ... 1350k',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251102-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        290,
        'Góp cổ phần vào nuôi nhum: mua thùng xốp + băng keo đi nhận nhum con',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        250,
        'Gửi 1 thùng cho Baba phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        200,
        'Nhận 2 thùng kiếm steak cho Phương Dung gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        450,
        'Gửi 3 thùng cho DPN và 1 thùng cho chị Hằng DN + 1t cho Ngọc Anh',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-10 23:54:00',
        41024000,
        'Anh Bắc trương định thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        41024000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251101-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-10 23:54:00',
        4040400,
        'Mayonaka thanh toan thang 10 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV ĐẠI VY (NH MAYONAKA)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251101-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-10 23:54:00',
        8370000,
        'CTY VO GIA TT HD 1102 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251101-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-10 23:54:00',
        65.485,
        'Tra lai so du tren tai khoan - thang 10/2025',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('Techcombank', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251101-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        110,
        'Thu phí home banking',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251101-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-10 23:54:00',
        1500000,
        'Chị Hương Q1 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251101-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-10 23:54:00',
        1860000,
        'Góp cổ phần dự án nhum: Thanh toán tiền mua nhum con của cô Mai: 310 con * 6k',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251101-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        86444820,
        'Thanh toán công nợ nhập loin EBT SG',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CÔNG TY TNHH EBT SÀI GÒN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251031-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        2891700,
        'Lẩu cá tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT 138 ENT (LẨU CÁ THANH ĐA) - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251031-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        2047500,
        'TO HUYNH BAO CHAU tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS CHÂU TO - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251031-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        10,
        'THU PHI DICH VU IBDN',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        1,
        'THU PHI DICH VU IBDN',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        13.945,
        'INTEREST LIQUIDATION - LAI NHAP GOC',
        get_or_create_txn_category('Chi phí khác', 'INCOME'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        30,
        'THU PHI SMS BANKING',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        3,
        'THU PHI SMS BANKING',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        30,
        'CHARGE FOR ACCOUNT MANAGEMENT - PHI QUAN LY TK',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        3,
        'CHARGE FOR ACCOUNT MANAGEMENT - PHI QUAN LY TK',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251031-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        75,
        'Mua đồ đơm',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        41355000,
        'Phú thịnh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        41355000,
        'TT công nợ chị Gái vĩnh trường',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        11155000,
        'Anh Thống võ gia thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        11155000,
        'TT công nợ Chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        20,
        'Bơm lớp xe tải',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        690,
        'Mua 15 bao đá bi ngày 30/10 + 15 bao ngày 31/10',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        800,
        'Gửi 8 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        69,
        'Mua bột giặt cho xưởng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        100,
        'Mua thêm 2 ream giấy A4',
        get_or_create_txn_category('Văn phòng phẩm', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251031-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        50,
        'Chị Châu To thanh toán phí vận chuyển (công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS CHÂU TO - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251031-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        11750000,
        'Thanh toán trả lại tiền cho Sushi To (xuất hđ dư, đã unc)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251031-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        5600000,
        'An PHú thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH XK & NK AN PHÚ (HSX 55 MỄ TRÌ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251031-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-31',
        1328000,
        'TT công nợ chị Ngân hòn xẹn',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ NGÂN - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251031-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        1300000,
        'Anh Hải Triều thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẢI TRIỀU - Q10 - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251031-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-31',
        4500000,
        'Thơm Vua Biển thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THƠM - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251031-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        10869915,
        'CT TNHH TM DV SUSHITO chuyen tien s hd 1057 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        1042910,
        'thanh toan hoa don 85 cho Nguyen Van Ngo: mua đá dải đường đoạn vào xưởng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        525,
        '5 kg vem MaXis LQD công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH MAXI - NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        100000000,
        'OCEAN LINK VIET NHAT chuyen tien công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        5367000,
        'thanh toan tien mua hang cho Nguyen Thi Hong Son TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        3150000,
        'ATABLE Ca ngu Eco Organic 110925 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM VÀ DV ATABLE VN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        1965600,
        'PHAN XUAN LOC chuyen công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('ANH LỘC - ĐÔNG NAI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        4219095,
        'Tiền lãi khoản vay tín dụng tháng 10/2025',
        get_or_create_txn_category('Lãi vay', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251030-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        253607772,
        'Nộp thuế GTGT Q3/2025',
        get_or_create_txn_category('Thuế', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Vay tin dung'),
        '20251030-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        129,
        'Mua dầu ăn cho xưởng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        310,
        'Đổi bình gas',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        500,
        'Gửi 2 thùng xe cont cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        500,
        'Nhận 5 thùng nhum nguyên con chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        500,
        'Gửi 2 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        550,
        'Gửi 5thùng DPN + 1 t cho anh Toàn ĐN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        2600000,
        'Thanh Thảo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        2600000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        210,
        'Thanh toán tiền Grab a Trãi 3 đơn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        250,
        'Gửi 1 thùng tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        750,
        'Gửi 3 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        1100000,
        'Nhận 6 thùng bt chị PHạm Thị Lợi gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        150,
        'Gửi 1 thùng Vạn Quang vĩnh long',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        200,
        'Gửi 2 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251030-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        2400000,
        'Phan duy van tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        4350000,
        'Phan duy van tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        1596000,
        'Mr Hai HN tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        140,
        'Ms Đình Phong tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS ĐÌNH PHONG - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        1343000,
        'Ms Thủy Tiên tt công nợ bill 30/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THỦY TIÊN - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        1574640,
        'Chị Tuyền thủ đức thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TUYỀN- THỦ ĐỨC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        3900000,
        'Big Sushi - Lê Nhã thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('BIG SUSHI - LÊ NHÃ - ĐN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        973,
        'Anh Thái tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-30',
        50,
        'Nagi thanh toán tiền vận chuyển công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251030-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        7477000,
        'TT công nợ chị Kim Loan',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251030-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        59197000,
        'TT công nợ chị Phạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251030-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-30',
        248.5,
        'Thanh toán tiền anh sushi O Ba ck dư công nợ',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('SUSHI O BA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251030-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        1343000,
        'Giao hàng Sò Lông Nửa Mảnh + Hải Sâm + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('MS THỦY TIÊN - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        140,
        'Giao hàng Trứng Nhum Gai khay 200g',
        NULL,
        get_or_create_partner('MS ĐÌNH PHONG - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        12400000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TP NHẬT KOTO (MR KIÊN- HL)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        22579200,
        'Giao hàng Mực nang nút 9-10',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        3013600,
        'Giao hàng Cá Cờ Kiếm Saku + Bạch tuộc tako + Nang roll + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        1596000,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        13361328,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        525,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('NH MAXI - NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        26305365,
        'Giao hàng phí vận chuyển + Chả cá + Tuna loin 3-5 + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        4500000,
        'Giao hàng Tuna đầu đuôi portion',
        NULL,
        get_or_create_partner('MS THƠM - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        3900000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('BIG SUSHI - LÊ NHÃ - ĐN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        23500500,
        'Giao hàng Tuna Saku A + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        973,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        9157500,
        'Giao hàng Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        12136400,
        'Giao hàng Chả Cá Viên + Mực Nang 500-800 + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        4491600,
        'Giao hàng phí vận chuyển + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251030-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        4963000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251030-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-30',
        59197500,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251030-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        21853000,
        'Giao hàng Bạch tuộc tako + Râu bạch tuộc',
        NULL,
        get_or_create_partner('CT TNHH TM TP SH (SH FOODS)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        2940000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        3205900,
        'Giao hàng Cá tai + Cá Hồng Biển',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        2971500,
        'Giao hàng Cá Hồng Biển + Sò Lông Nửa Mảnh + Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        1291250,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        9183200,
        'Giao hàng phí vận chuyển + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        22265000,
        'Giao hàng Mực Nang sushi Sashimi đông khay (200g/ khay) + Bạch tuộc tako slice (160 gram/khay) + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH MEAT AND FISH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        6586000,
        'Giao hàng Tuna rẻo CO + Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        3300000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('CT TNHH MTV TM NAM ANH FOODS (MR VINH- ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        6350000,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR TOÀN - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        21450800,
        'Giao hàng Mực Nang 500-800 + Kiếm steak + chả cá hấp + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251029-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        5367000,
        'Nhập hàng Nhum hũ + Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251029-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        13544000,
        'Nhập hàng Bạch tuộc tươi + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251029-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        5194800,
        'Nhập hàng phí vận chuyển + Cá tai + Cá Bè (Cá Khế, Cá Giấy, cá viễn) + Cá Hồng Biển',
        NULL,
        get_or_create_partner('NCC MR TRƯỜNG SSM - PY ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251029-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-29',
        18400000,
        'Nhập hàng Chả cá + Chả Cá Viên',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251029-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        539.7,
        'Nagi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        8230950,
        'QUAN MUI DACN DNTN XD LONG PHUOC) TT TIEN HAI SAN HD 1128 Anh Chánh tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CN DNTN XD LONG PHƯỚC (MR CHÁNH-VT)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        2047500,
        'CONG TY TNHH DAU TU NTP TT CA NGU 2 010: anh Tình tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        8505000,
        'FBC Sai Gon thanh toan công nợ than g 9/2025',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('GOFOOD-SG (CT TNHH FBC SÀI GÒN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        898.2,
        'Eco góp vốn vào dự án nhum (thanh toan hoa don 83 cho Nguyen Van Ngo)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        32073840,
        'CONG TY TNHH THUONG MAI THUC PHAM SH tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM TP SH (SH FOODS)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        60556125,
        'thanh toan hoa don 642 cho cty Duong Tuan Phat TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        4490850,
        'TRAN THI THAO TRANG chuyen tien Kin sushi tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('KIN SUSHI - LÂM ĐỒNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251028-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        25628400,
        'Go Food HN thanh toán công nợ t9',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('GOFOOD- HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251028-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        1477700,
        'Phiphi sushi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV ISHIGA (PHIPHI SS)- ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251028-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        700,
        'Hoa hồng bếp trưởng Buzza tháng 8/2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        150,
        'Thu tiền bán giấy phế liệu',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        92,
        'Gửi 200 bộ khay nhum ra PHú Quý cho Tham Võ',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        9056600,
        'Uni thanh toán công nợ từ 19/10-25/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        4200000,
        'TT công nợ Marusei DN',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC MARUSEI- ĐÀ NẴNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        4856600,
        'TT công nợ Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        5259500,
        'NBQN CS1 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH QUẢNG NINH-CS1', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        5259500,
        'TT công nợ Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        1892000,
        'Hây sushi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HÂY SUSHI - CẦN THƠ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        1892000,
        'TT công nợ Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        28075000,
        'TP ngày mới tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        28075000,
        'TT công nợ Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        700,
        'Nhận 6 thùng nhum nguyên con chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        750,
        'Gửi 3 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        260,
        'Mua đá khói đóng hàng nhum 100g cho Haru',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        100,
        'Xe ba gác chở bt bé tân về xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        10,
        'Đổi bình ga mini',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        500,
        'Gửi 4t lớn + 2t nhỏ (70kg nhum) cho Ocean Link DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        100,
        'Mua 2 ream giấy A4 (IK 70g)',
        get_or_create_txn_category('Văn phòng phẩm', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        750,
        'Nhận 5 thùng nang Truyền vũng tàu gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        750,
        'Gửi 3 thùng cho vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        800,
        'Đổ xăng xe tải',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        700,
        'Gửi 3 thùng xe cont ra HN cho Phương',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        690,
        'Mua 15 bao đá bi ngày 27/10 + 15 bao ngày 28/10',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        170,
        'Nhận 1 thùng nhum khay Đặng lý sơn gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        20,
        'Nhận 1 thùng nang sushi mr Công gửi (tiền bãi xe vũ mập)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        370,
        'Tiền thu gom rác 37 bao',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        300,
        'Gửi 3 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        100,
        'Gửi 1 thùng cho Lệ sài gòn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251028-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        3395000,
        'Trung Daknong + cafe Hoàng Trung Tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS HUẾ- SG (ANH TRUNG- DAKNONG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251028-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        36545.00034722222,
        'Quán tanaka Tei thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('QUÁN TANAKEI - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251028-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        45600000,
        'Nhận 4 thùng nhum cô Thủy 4*12*950k công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251028-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-28',
        2077700,
        'Hanna Sushi Thái Bình tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HANA SS- THÁI BÌNH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251028-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        2290000,
        'Eco góp vốn vào dự án nhum (mua cá, sò, ... của anh Ngọ Cát Lợi, ck Vo Thi Kim Thao)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251028-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-28',
        1850000,
        'Thanh toán nhum nguyên con của Bùi Thị Quanh',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251028-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        5433750,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('NH QUẢNG NINH- CS2', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        18000000,
        'Giao hàng Trứng nhum AA 100g/khay + tuna steak',
        NULL,
        get_or_create_partner('CT TNHH DG GROUP (HARU - Q12)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        6250000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT MARUSEI - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        81500000,
        'Giao hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        1050000,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        1354500,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('CT MARUSEI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        1961000,
        'Giao hàng Tuna Saku A + Bạch tuộc tako',
        NULL,
        get_or_create_partner('HANA SS- THÁI BÌNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        4490850,
        'Giao hàng Trứng nhum AA 100g/khay + Tuna Saku A',
        NULL,
        get_or_create_partner('KIN SUSHI - LÂM ĐỒNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        2280000,
        'Giao hàng Rẻo cá cờ kiếm',
        NULL,
        get_or_create_partner('MR GIANG- VẠN GIÃ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        13110000,
        'Giao hàng Nhum nguyên con (đvt: con) + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        31155000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251028-057'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        6690800,
        'Nhập hàng Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT HẢI SẢN LINH LINH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251028-058'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        18000000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251028-059'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        19514998,
        'Nhập hàng Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - ĐẶNG - LÝ SƠN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251028-060'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        47740000,
        'Nhập hàng Mực Nang 500-800 + Mực nang nút 9-10',
        NULL,
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251028-061'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-28',
        15960000,
        'Nhập hàng Mực Nang sushi Sashimi đông khay (200g/ khay)',
        NULL,
        get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251028-062'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-27',
        89444000,
        'Thanh toan hoa don 156 lần 1 cho cty Go Food (họ ck lại tk cá nhân sau khi trừ VAT)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Vay tin dung'),
        '20251027-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        8230950,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CN DNTN XD LONG PHƯỚC (MR CHÁNH-VT)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        1890000,
        'Giao hàng Râu bạch tuộc + Tuna Saku A',
        NULL,
        get_or_create_partner('MR HIỆP- BẮC GIANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        1102500,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        9625000,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        650,
        'Giao hàng Sò Lông Nửa Mảnh',
        NULL,
        get_or_create_partner('MR QUỐC HOÀN - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        28623132,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        1892100,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('HÂY SUSHI - CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        7049000,
        'Giao hàng Bạch tuộc tako + Bạch Tuộc Tako nhỏ',
        NULL,
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        5722500,
        'Giao hàng Kiếm steak',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        34563120,
        'Giao hàng tuna saku + Chả cá + phí vận chuyển + Tuna loin 3-5 + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251027-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        36712.00034722222,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251027-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        12300000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251027-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        19908000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251027-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        25483500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251027-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-27',
        45600000,
        'Nhập hàng Nhum hũ',
        NULL,
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251027-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-26',
        3457000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251026-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-26',
        18640400,
        'Giao hàng Kiếm steak + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251026-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-26',
        2520000,
        'Giao hàng Tuna Saku A + Râu bạch tuộc',
        NULL,
        get_or_create_partner('FAMILY SUSHI  - QNAM', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251026-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        123091500,
        'thanh toan hoa don 257 va 289 cho cty Hoan Truyen TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        109294000,
        'thanh toan hoa don so 3 lan 1 cho Le Thi Suong Tuyet TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        20682000,
        'thanh toan hoa don 34 cho Tran Thi Dung TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VẸM - DŨNG  - CR', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        37553250,
        'thanh toan hoa don 309 cho cty Viet Organic TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT VIỆT ORGANIC - TAM QUAN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        28570920,
        'thanh toan hoa don 197 cho cty TS Hong Ngoc TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC LƯỜN KIẾM - CHỊ PHƯƠNG DUNG - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        12360500,
        'thanh toan hoa don 1512, 1593, 1692 cho cty Nam Thinh Long',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        13608000,
        'thanh toan hoa don 260 cho cty BB Sang Trong',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        24393600,
        'thanh toan hoa don 10 cho cty EBT SG TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CÔNG TY TNHH EBT SÀI GÒN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        2060000,
        'thanh toan hoa don 2802 cho cty Phuong Nam',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        3115068,
        'Thu nợ thu lãi vay mua 2 xe',
        get_or_create_txn_category('Lãi vay', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251025-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        9000000,
        'Thu nợ thu gốc vay mua 2 xe',
        get_or_create_txn_category('Lãi vay', 'EXPENSE'),
        get_or_create_partner('Việt Nga - VRN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('VRN CTY'),
        '20251025-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        1210000,
        'Nhận 10 thùng sò lông + nhum',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        700,
        'Gửi 3 thùng Phú Quốc cho vạn quang và baba',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        50,
        'Gửi 1 thùng cho Mai Trinh dn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        1000000,
        'Gửi 4 thùng tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        297,
        'Hoa hồng a Bùi văn tuấn nha trang',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        2200000,
        'Hoa hồng a Vũ Quang DN (the View và the One) T8',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        720,
        'Hoa hồng anh Khanh Hadu T9',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        2520000,
        'Đưa cô Dư tiền ăn tuần tiếp',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        8544000,
        'Anh Lượng bắc ninh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LƯỢNG - BẮC NINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        8544000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        7185000,
        'Thảo PY thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('KIM THẢO - PY', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        7185000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        23647000,
        'Trường SSM thanh toán công nợ đến hết 25/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        23647000,
        'TT công nợ chị Gái vĩnh trường',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        19514000,
        'Sushi O Ba thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SUSHI O BA', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        19514000,
        'TT công nợ bt Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        12075000,
        'NBQN cs2 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH QUẢNG NINH- CS2', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        12075000,
        'TT công nợ bt Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        50,
        'Gửi 1 thùng cho a Nhân đn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        20,
        'Đổ xăng xe máy',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        300,
        'Gửi 3 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        95,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251025-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        2285000,
        'Thanh toán phí ship kvsg 08-14/10/2025',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251025-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        229.824,
        'Anh Lee Minh Heo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251025-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        2891200,
        'Chef Hồng (Moca) thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CHEF HỒNG - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251025-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        36577.00034722222,
        'Anh Đông phú quốc thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251025-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        700,
        'Khách của Ngân TH thanh toán bill lườn kiếm nướng',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('KHÁCH LẺ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251025-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        2714000,
        'Thanh toán phí vc kv Hn 10-20/10',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251025-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        10433000,
        'TT công nợ bt chị Nga phú yên',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - CHỊ NGA - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251025-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        20165000,
        'TT công nợ chị Hồng Châu (hết)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HỒNG CHÂU - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251025-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        40800000,
        'TT công nợ chị Phúc (nhum + sò lông)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251025-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        269,
        'Thanh toán tiền cá tươi chị Xuân Phương',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251025-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-25',
        36609.00034722222,
        'Mr Hoàn mua 2 quạt tại Toàn Ngọc + vat 8%',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251025-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        33810000,
        'CT TNHH SON MAI VI BIEN thanh toan công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-25',
        24937920,
        'Sushi To thanh toán công nợ Chuyen khoan shd 1092, 1093',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251025-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        2994000,
        'Giao hàng Kiếm vỉ nướng + Trứng nhum AA 100g/khay + Bánh Takoyaki + Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg) + Bạch tuộc LSNC 30-50 + Tuna Saku A + Mực Ống',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        11216000,
        'Giao hàng Tuna rẻo CO + Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        36572.00034722222,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('HKD Y SA BI (MS GIA HÂN- TRÀ VINH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        2738200,
        'Giao hàng Bạch tuộc tako + Tuna Saku A + Nang roll',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        4042500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR THỦY- NGHỆ AN (FUJIMO)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        582,
        'Giao hàng Bạch tuộc tako + Nang roll',
        NULL,
        get_or_create_partner('MR THUẬN- SG (NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        1872000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('ANH LỘC - ĐÔNG NAI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        2020200,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        440,
        'Giao hàng Bào Ngư',
        NULL,
        get_or_create_partner('MS LINH - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        3300000,
        'Giao hàng Trứng nhum AA 100g/khay',
        NULL,
        get_or_create_partner('DOAN TAM KICCHOU - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251025-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-25',
        7200000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251025-057'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        12757500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        7578500,
        'Giao hàng Bào Ngư + Tuna Saku A + Loin kiếm + Loin kiếm + Sò Lông Nửa Mảnh + Sò Lông Nửa Mảnh',
        NULL,
        get_or_create_partner('SUSHI O BA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS LÌ - SÀI GÒN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        1800000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        3937500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH SAKURA SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        3080000,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH KIWAMI VN - MR TUẤN - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        12323599,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        6313500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CN CT CP TM VÀ DV VIET DELI - NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        11900075,
        'Giao hàng phí vận chuyển + Chả cá + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        11206425,
        'Giao hàng Sò Lông Nửa Mảnh + phí vận chuyển + Bạch tuộc tako + tuna saku',
        NULL,
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        229.824,
        'Giao hàng Râu Tako A',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        3440000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        2750000,
        'Giao hàng Sò Lông Nửa Mảnh + Vẹm Xanh Tách Vỏ ( PE) + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('MR TRƯỜNG - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        1148400,
        'Giao hàng Cá Hồng Biển',
        NULL,
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        2891200,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('CHEF HỒNG - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        834.25,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        8928000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        2591000,
        'Giao hàng phí vận chuyển + Trứng nhum AA 100g/khay + Bạch Tuộc Tako nhỏ',
        NULL,
        get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251024-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        2917000,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251024-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        3523450,
        'Nhập hàng phí vận chuyển + Cá Bè (Cá Khế, Cá Giấy, cá viễn) + Cá Hồng Biển',
        NULL,
        get_or_create_partner('NCC MR TRƯỜNG SSM - PY ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251024-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-24',
        28800000,
        'Nhập hàng Sò Lông nguyên liệu + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251024-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        5872650,
        'KYOTO-ECO-231025 tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT KYOTO YAKINIKU - A CHÂU - DN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251023-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        1956080,
        'Eco góp vốn vào dự án nhum (thanh toan hoa don 73 cho Nguyen Van Ngo)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251023-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        539.7,
        'NAGI-ECO-HD1103-231025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251023-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        47542615,
        'Anh Minh Anh thanh toán lại tiền thừa (hđ so với phát sinh thực tế hàng mục làm tầng 2 cho xưởng: hóa đơn: 244,684,000, thực tế phát sinh là: 197,141,385)
',
        get_or_create_txn_category('Khác', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        47542615,
        'TT công nợ chị Gái vĩnh trường',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        20845500,
        'Mr Trung hà tĩnh tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TP TS SẠCH HÀ TĨNH (TRUNG-HÀ TĨNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        20845500,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        2600000,
        'Chị Trinh Q7 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        2600000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        50000000,
        'Thiên Trang tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        50000000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        36852.00034722222,
        'Chị Giang cần thơ thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        36852.00034722222,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        490,
        'Thanh toán tiền Grab ĐN: giao 7t Viet Nhat + 1t Marusei + 1t Kyoto',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        80,
        'Nhận 1 thùng kiếm steak Trường Thảo gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        800,
        'Gửi 8 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251023-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        4050000,
        'Omasake tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH HÀN QUỐC OMAKASE', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251023-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        750,
        'Anh Long Thịnh Liệt thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LONG - THỊNH LIỆT - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251023-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-23',
        50,
        'Nagi thanh toán tiền vận chuyển',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251023-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        5643000,
        'TT công nợ bt chị Ngân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ NGÂN - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251023-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-23',
        6202000,
        'TT công nợ bt Út Trần',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC TRẦN THỊ ÚT - PHÚ YÊN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251023-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        1574640,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR NGUYỄN ANH - LINH ĐÀM - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        9440000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        750,
        'Giao hàng Sò Lông Nửa Mảnh',
        NULL,
        get_or_create_partner('MR LONG - THỊNH LIỆT - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        700,
        'Giao hàng Lườn kiếm nướng',
        NULL,
        get_or_create_partner('KHÁCH LẺ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        290,
        'Giao hàng Mực Ống',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        40792600,
        'Giao hàng Chả cá + chả cá hấp + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        3250000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        9302500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251023-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        1800000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        4760000,
        'Nhập hàng Kiếm steak',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        6202000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC TRẦN THỊ ÚT - PHÚ YÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        10800000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        20384000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-23',
        5560000,
        'Nhập hàng phí vận chuyển + Mực Ống',
        NULL,
        get_or_create_partner('NCC LỢI THU - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251023-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251022-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        66182662,
        'Cty TP Phu Quoc TT Cty Eco ORGANIC tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251022-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        2881200,
        'Lê Gia (CA KIEM T8-220925-09:41:09 374523) tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT LÊ GIA (MINORI CS2)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251022-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        10219620,
        'Góp cổ phần dự án nuôi nhum (thanh toan tien mua hang cho Cty Thanh Dat)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251022-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        94684000,
        'thanh toan lan 3 hoa don so 6 cho cty Dai Viet công nợ',
        get_or_create_txn_category('Chi phí Sửa chữa, Bảo trì', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251022-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        290,
        'Mua đồ cúng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        40,
        'Nhận thùng 10kg hàu nhật Marusei DN gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        227200000,
        'Go Food ck trả lại hđ  152 đã unc (sau khi trừ đi phần tiền VAT)',
        get_or_create_txn_category('Khác', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        227200000,
        'TT công nợ chị Gái vĩnh trường',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        230,
        'Dự án nhum: mua đồ cúng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        38589000,
        'Phú Thịnh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        38589000,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        5092000,
        'Thiệu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THIỆU - NHA TRANG (CÁ NHÂN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        5092000,
        'TT công nợ ncc Lợi Thu',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC LỢI THU - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-22',
        300,
        'Gửi 3 thùng DPN ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251022-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        521.5,
        'Anh Thái hn tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251022-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        1278000,
        'yakiyum Nguyễn văn lộc tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH YAKI YUM - NGUYỄN VĂN LỘC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251022-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-22',
        5874000,
        'Định thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐỊNH- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251022-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        3650000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        23399280,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        6022275,
        'Giao hàng Tuna Saku XK + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT CP QL KS VÀ KND LYNN TIMES (MR ĐINH ĐỒNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        5835000,
        'Giao hàng Xương cá cờ kiếm + sụn xương cá kiếm',
        NULL,
        get_or_create_partner('KIM THẢO - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        1050000,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        1200000,
        'Giao hàng Kiếm vỉ nướng + Bạch tuộc LSNC 30-50 + Tuna Saku A + Bánh Takoyaki',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        564,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        2400000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        4050000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('NH HÀN QUỐC OMAKASE', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        16281600,
        'Giao hàng Chả cá + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        10200000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251022-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        2000000,
        'Nhập hàng Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg)',
        NULL,
        get_or_create_partner('NCC MARUSEI- ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251022-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-22',
        18000000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251022-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        238560000,
        'Thanh toan hoa don 152 cho cty Go Food (họ ck lại tk cá nhân sau khi trừ VAT)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Vay tin dung'),
        '20251021-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        13561284,
        'NAM SAN TT ECO T8.25 CL-211025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251021-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        3350030,
        'Góp cổ phần Dự án nhum (thanh toan tien mua hang cho Pham Thi Nga: mua hóa chất)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251021-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        23436000,
        'DAO HAI SAN thanh toan Eco Organic Nha Trang theo HD 893 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐẢO HẢI SẢN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251021-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        250,
        'Gửi 1 thùng tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        500,
        'Nhận 4 thùng sò lông chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        500,
        'Gửi 2 thùng cho Vạn Quang pq',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        80,
        'Nhận 1 thùng tuna saku 4A Trường py gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        560,
        'Tiền thu gom rác 56 bao',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        150,
        'gửi 1 thùng cho Vạn Quang vĩnh long',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        1550000,
        'Gửi 16 thùng ĐN: DPN + Ocean + Kyoto',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        500,
        'Gửi 2 thùng xe cont cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        1300000,
        'Khách Thanh Thủy bình định thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        1300000,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        4768600,
        'Hadu thanh toán công nợ T9 phần tk cá nhân',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        4768600,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251021-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-21',
        7000000,
        'Mua 1 bao 25kg phụ gia bạch tuộc Thái (vì phụ gia nhật không về kịp)',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251021-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        248,
        'Anh Hoàng thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HOÀNG - NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251021-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        2550000,
        'Huyền Trang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS HUYỀN TRANG - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251021-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        4135950,
        '(tran thi thao trang) Kin sushi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('KIN SUSHI - LÂM ĐỒNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251021-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        13422800,
        'Anh Bắc Trương Định tt công nợ 26/9+13/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251021-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-21',
        3900000,
        'Anh Hợp đà nẵng thanh toán bill công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251021-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        36852.00034722222,
        'Giao hàng phí vận chuyển + Tuna Saku A',
        NULL,
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        4760000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        1574600,
        'Giao hàng Bạch tuộc tako + phí vận chuyển',
        NULL,
        get_or_create_partner('MS TUYỀN- THỦ ĐỨC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        2792600,
        'Giao hàng Mực Ống + Bạch tuộc tako + Tuna Saku A + Râu bạch tuộc + Tôm Thẻ Lột + Bạch tuộc LSNC 30-50 + Vẹm Xanh Tách Vỏ ( PE) + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        2426300,
        'Giao hàng Bạch tuộc tako + Nang roll + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        13792350,
        'Giao hàng Bạch tuộc tươi + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        10373450,
        'Giao hàng phí vận chuyển + Chả cá + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        1350000,
        'Giao hàng sụn xương cá kiếm',
        NULL,
        get_or_create_partner('KIM THẢO - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        3900000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        2100000,
        'Giao hàng Tuna Saku A + tuna saku + Bạch tuộc tako',
        NULL,
        get_or_create_partner('MS DƯƠNG MINH LÝ- QUẢNG NINH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        46070.00034722222,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay) + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        4491600,
        'Giao hàng phí vận chuyển + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        3125000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('NH TAKO IKA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        3692000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT KYOTO YAKINIKU - A CHÂU - DN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        21705500,
        'Giao hàng Tuna Saku A + Bạch tuộc tươi + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        64955700,
        'Giao hàng Tuna loin 3-5 + tuna saku + Bạch tuộc tako + Mực Nang 500-800 + Kiếm steak + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        116100000,
        'Giao hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251021-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        12000000,
        'Nhập hàng Sò Lông nguyên liệu',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251021-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-21',
        16195000,
        'Nhập hàng tuna saku',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251021-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        23436000,
        'CTY SHIZEN FOOD TT TIEN HANG T10/2025 (TT công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV SHIZEN FOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251020-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        98640000,
        'Meat And Fish ck tien coc nhim bien (TT công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MEAT AND FISH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251020-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        20148840,
        'Marusei thanh toan Eco HD 1034, 1060, 1076 (tt công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT MARUSEI - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251020-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        112947420,
        'Vạn Quang TT công nợ tháng 9 phần unc',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251020-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        4095000,
        'NTP TT CA NGU 1 110 1310 (Anh Tình tt công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251020-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1900000,
        'Quà 20/10 cho chị em phụ nữ xưởng: 100k/người: Trang, Hiền, Sa, Ly, Duyên, Lý, Phượng, Dư, Nở, Thảo, Hiền, Luyến, Bình, Thy, Thủy,  Ngợi, Lệ, Trâm Anh, Phương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1841000,
        'Thanh toán tiền ship khu vực HN 01-09/10',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        7781000,
        'A Thống võ gia tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        7781000,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        840.017,
        'Đổ xăng xe tải',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        2838000,
        'Võ Cảnh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        2838000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        4814000,
        'Uni sushi thanh toán công nợ đến hết 18/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        4814000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        1480000,
        'Chị Lan nha trang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS LAN - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1480000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        5329718,
        'Vạn quang thanh toán công nợ t9 phần cá nhân',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        650,
        'Nhận 2 thùng nhum con + 3  thùng sò lông NL chị Phúc gưi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        500,
        'Gửi 2 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1150000,
        'Nhận 8 thùng bạch tuộc chị Phạm Thị Lợi gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        70,
        'Xe ba gác chở 8 thùng tuộc từ xe về xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        150,
        'Gửi 1 thùng cho chị Giang CT',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1000000,
        'Gửi 10 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251020-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-20',
        1440000,
        'Sushi Garden Nguyễn Trãi tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SS GARDEN NGUYỄN TRÃI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251020-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        75655000,
        'TT công nợ chị PHạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251020-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        19000000,
        'TT công nợ chị Võ Thị Thắm - phú quý',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VÕ THỊ THẮM - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251020-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        1575000,
        'Sơn Mua đá gel',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251020-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        20150000,
        'TT công nợ chị Phúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251020-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        3045000,
        'CK tiền mua tôm: 15*175+3*140',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251020-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-20',
        800,
        'Thanh toán tiền anh Thi sửa kho',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251020-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        6250000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT MARUSEI - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        6250000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT MARUSEI - ĐN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        4823600,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        5888000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        1050000,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        1780000,
        'Giao hàng Cá Cờ Kiếm Saku + Râu bạch tuộc + Tuna Saku A + Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg) + Bạch tuộc LSNC 30-50 + Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        9398268,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        3937500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH SAKURA SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        2250000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR THIÊN SS- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        5332000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        1440000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('SS GARDEN NGUYỄN TRÃI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        1440000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('SS GARDEN NGUYỄN TRÃI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        3622500,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('NH QUẢNG NINH- CS2', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        521.5,
        'Giao hàng Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        54115200,
        'Giao hàng Nhum nguyên con (đvt: con) + Kiếm steak + Chả cá + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251020-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        75655000,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251020-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-20',
        19040000,
        'Nhập hàng Nhum hũ',
        NULL,
        get_or_create_partner('NCC VÕ THỊ THẮM - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251020-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-19',
        2594500,
        'Giao hàng phí vận chuyển + Kiếm steak + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('CT TNHH DV TOTORO VN (MS HẰNG - ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251019-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-19',
        15655000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251019-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-19',
        2345000,
        'Giao hàng Râu bạch tuộc + Tuna Saku A',
        NULL,
        get_or_create_partner('MR HIỆP- BẮC GIANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251019-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-19',
        14150000,
        'Nhập hàng Sò Lông nguyên liệu + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251019-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        10000000,
        'Namsan TT công nợ T8,2025',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251018-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        3417750,
        'CT TNHH KIWAMI VIET NAM chuyen tien thanh toan hd 1079 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH KIWAMI VN - MR TUẤN - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251018-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        2331000,
        'Naked Foods thanh toan nguyen lieu Eco công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NAKED FOODS QUẬN 3', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251018-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        8370000,
        'CTY VO GIA TT HD 1031 CHO CTY ECO O RGANIC-181025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251018-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        158,
        'Mua nước rửa chén + Vim vệ sinh cho xưởng',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        295,
        'Mua 25 đôi găng tay cao su',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        420,
        'Nhận 3 thùng nang Truyền gửi xe Ngọc Phát',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        18566000,
        'Anh Đỗ Xuân Nha Trang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SX-TM THIÊN ÂN PHÁT (MR ĐỖ XUÂN-NT)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        18566000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        11460000,
        'Chị Giang cần thơ thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        11460000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        4690000,
        'Anh Hiệp bắc giang tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HIỆP- BẮC GIANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        4690000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        2345000,
        'Anh Hiệp bắc giang tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HIỆP- BẮC GIANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        2345000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        1456707,
        'Thanh toán tiền mr Hoàn + Sơn tiếp khách DPN tại nhà hàng Bé Tân',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        630,
        'Thanh toán tiền Grab 4t * 70k + 5t Việt Nhật *50k',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        300,
        'Nhận 2 thùng nhum nguyên con chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        60,
        'ngày 6/10, Sơn nhận 1 thùng nhum nguyên con chị Phúc gửi 600 con',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        110,
        'Sơn mua đá gel: 22kg *5k',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        1500000,
        'Đưa cô Dư tiền ăn tuần tiếp theo',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        368,
        'Mua 16 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        345,
        'Mua 15 bao đá bi (chiều)',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        50,
        'Gửi 1 thùng cho chị Hằng DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        50,
        'Gửi 1 thùng cho Marusei DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        120,
        'Gửi 1 thùng vỏ khay nhum cho Đặng lý sơn',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251018-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-18',
        38500000,
        'TT công nợ chị Phúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251018-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        3900000,
        'Anh Hợp đà nẵng thanh toán bill công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251018-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        3770000,
        'Anh Hoàng Vũ thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HOÀNG VŨ - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251018-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-18',
        10237500,
        'Anh Đô thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐÔ - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251018-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        3287600,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        3623025,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('NH QUẢNG NINH-CS3', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        25726000,
        'Nhập hàng Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        112550000,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ)',
        NULL,
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        5924500,
        'Giao hàng Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        6089000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH TM DV ONE MOREANH (MR TUẤN NGHĨA- ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        7936500,
        'Giao hàng Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        10237500,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('MR ĐÔ - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        116100000,
        'Giao hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        2550000,
        'Giao hàng Chả cá',
        NULL,
        get_or_create_partner('MS HUYỀN TRANG - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        3080500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT CP TẬP ĐOÀN DU THUYỀN- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        1650000,
        'Giao hàng Râu bạch tuộc + Tuna Saku A + Bánh Takoyaki + Bạch tuộc LSNC 30-50',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        1650000,
        'Giao hàng Râu bạch tuộc + Tuna Saku A + Bánh Takoyaki + Bạch tuộc LSNC 30-50',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        2884700,
        'Giao hàng Cá Cờ Kiếm Saku + Nang roll + Tuna Saku A + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        564,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        3900000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        489.5,
        'Giao hàng Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('MR THUẬN- SG (NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        6200000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251018-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        5050500,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        6000000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        16800000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-18',
        128343600,
        'Nhập hàng Phí gia công + Tuna loin 5up + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CÔNG TY TNHH EBT SÀI GÒN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251018-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        103950000,
        'TT công nợ EBT SG nhập loin 5up (hđ số 6)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CÔNG TY TNHH EBT SÀI GÒN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Vay tin dung'),
        '20251017-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        2005521,
        'Cty Eco Organic thanh toan Thaco Khánh hòa: tiền bảo dưỡng xe Mazda',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        1417500,
        'PHAM XUAN THANH chuyen tien trung nhum công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SƠN BA (MR THÀNH VIN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        4154000,
        'thanh toan tien mua hang cho Nguyen Thi Hong Son TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        5933110,
        'Góp vốn vào dự án nuôi nhum (thanh toan hoa don so 66 cho Nguyen Van Ngo)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        48815000,
        'thanh toan tien mua hang cho Nguyen Thi Kim Dung TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        10527840,
        'Nam anh foods ck hd 1083 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV TM NAM ANH FOODS (MR VINH- ĐÀ NẴNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        11584080,
        'Delmar VN TT tien hang Cty Eco Orga nic Nha Trang công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251017-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        30,
        'Gửi hợp đồng cho Lê Công và Meat',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        20000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        2500000,
        'Thanh toán tiền lãi khoản vay 250tr tên mr Hoàn',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        2600000,
        'Thanh Thảo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        2600000,
        'TT công nợ chị Hoa hòn rớ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        500,
        'Gửi 2 thùng cho Phương Hn xe tài thắng',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        300,
        'Nhận 3 thùng sò lông chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        750,
        'Gửi 2 thùng cho Vạn Quang phú quốc và 1 thùng cho Baba PQ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        50,
        'xăng xe máy',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        50,
        'Nhận 1 thùng bt chị Nga phú yên gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        80,
        'Nhận 1 thùng tuna saku 4A Trường py gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        1300000,
        'Gửi 5t DPN + 7t Việt Nhật +1t A Nhân + 1t A Nghĩa',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251017-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        368.6,
        'Lee Minh Heo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251017-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        57000000,
        'Nhận 5 thùng nhum cô Thủy: 5*12*950k TT công nợ ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251017-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        1066000,
        'Khác lẻ thanh toán công nợ lườn tuna CÔNG NỢ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('KHÁCH LẺ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251017-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-17',
        36863.00034722222,
        'Thanh toán tiền lưu kho Ốc chị Minh hết lô xuất ngày 16/10',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251017-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-17',
        4042500,
        'Anh Thủy - Vinh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THỦY- NGHỆ AN (FUJIMO)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251017-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        9607500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        10784000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        1417500,
        'Giao hàng Trứng Nhum AA 200g/khay + VAT',
        NULL,
        get_or_create_partner('CT TNHH SƠN BA (MR THÀNH VIN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        2500000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT MARUSEI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        3250000,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn) + Tuna Saku XK',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        3770000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MR HOÀNG VŨ - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        39411500,
        'Giao hàng tuna saku + Vẹm Xanh Tách Vỏ ( PE) + Vẹm Xanh Tách Vỏ ( PE) + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        13890000,
        'Giao hàng phí vận chuyển + Bạch tuộc tako + tuna saku',
        NULL,
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        12167660,
        'Giao hàng phí vận chuyển + Chả cá + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        7378000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        368.6,
        'Giao hàng Râu Tako A',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        39129480,
        'Giao hàng Râu bạch tuộc + Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        1480000,
        'Giao hàng sụn xương cá kiếm',
        NULL,
        get_or_create_partner('MS LAN - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        1066000,
        'Giao hàng Lườn tuna',
        NULL,
        get_or_create_partner('KHÁCH LẺ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        37212400,
        'Giao hàng Chả cá + Nhum nguyên con (đvt: con) + tuna saku + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        9339000,
        'Giao hàng Trứng Nhum AA 200g/khay + Bạch tuộc tako slice (160 gram/khay)',
        NULL,
        get_or_create_partner('CT TNHH MEAT AND FISH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        3317000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        5924500,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        6089000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH TM DV ONE MOREANH (MR TUẤN NGHĨA- ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        7936500,
        'Giao hàng Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        10237500,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('MR ĐÔ - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        116100000,
        'Giao hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        2550000,
        'Giao hàng Chả cá',
        NULL,
        get_or_create_partner('MS HUYỀN TRANG - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251017-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        8000000,
        'Nhập hàng Sò Lông nguyên liệu',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251017-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        13585000,
        'Nhập hàng Loin kiếm',
        NULL,
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251017-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        131799000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251017-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        16400000,
        'Nhập hàng tuna saku',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251017-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-17',
        37343500,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ)',
        NULL,
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251017-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        9526650,
        'THANH TOAN SHD 1087 công nợ TP ngày mới',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM TP SH (SH FOODS)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251016-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        3200400,
        'Naked Foods thanh toan nguyen lieu Eco công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NAKED FOODS QUẬN 1', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251016-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        810,
        'Góp cổ phần bên dự án nhum (tiền thầy mua đồ cúng cho bên xưởng nuôi)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        2000000,
        'Góp cổ phần bên dự án nhum (tiền phong bì đưa thầy cúng cho bên xưởng nuôi)',
        get_or_create_txn_category('Khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        1050000,
        'Nhận 7 thùng bt chị PHạm Thị Lợi gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        220,
        'Nhận 1 thùng nhum khay Đặng lý sơn gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        300,
        'Nhận 3 thùng sò lông chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        100,
        'Tiền xe Vương + Trung từ kho chị Minh xuất ốc về xưởng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        600,
        'Gửi 6 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        3000000,
        'Tạm ứng lương T10,2025 cho Vương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        2000000,
        'Tạm ứng lương T10,2025 cho C Dư',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-16',
        2000000,
        'Tạm ứng lương T10,2025 cho Thủy',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251016-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        315,
        'Lee Minh Heo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251016-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        174600000,
        'Khách thanh toán tiếp Ốc thành phẩm',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251016-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        1314000,
        'Nguyễn thị thuỳ trang thanh toán công nợ (yaki yum nguyễn văn lộc)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH YAKI YUM - NGUYỄN VĂN LỘC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251016-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        1756800,
        'Dương Minh Lý thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS DƯƠNG MINH LÝ- QUẢNG NINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251016-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        1800000,
        '81/2 Hoàng Diệu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251016-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-16',
        2730000,
        'Anh Hùng mai hắc đế thanh toán công nợ (sau khi tự trừ hoa hồng)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251016-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        2602950,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('NH QUẢNG NINH-CS1', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        315.4,
        'Giao hàng Râu Tako A',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        13996000,
        'Giao hàng Tuna Saku A + Cá Cờ Kiếm Saku + Sò Lông Nửa Mảnh + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        2957650,
        'Giao hàng phí vận chuyển + Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('NH SUSHI MINH - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        1733900,
        'Giao hàng Bạch tuộc tako + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        35837800,
        'Giao hàng Nhum nguyên con (đvt: con) + Kiếm steak + chả cá hấp + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251016-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        5868000,
        'Nhập hàng Nhum nguyên con (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251016-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-16',
        73717000,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251016-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        80000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        800.1,
        'thanh toan tien kiem mau cho Case',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        3325000,
        'Ikusachi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SS IKUSACHI- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        68747800,
        'PGF THANH TOAN TIEN MUA THANG 08.20 25 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        66144930,
        'PGF THANH TOAN TIEN MUA HANG THANG 09.25 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH PGF ASIA- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        1650000,
        'thanh toan hoa don 2720 cho cty Phuong Nam',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        44156858,
        'thanh toan hoa don 171 va 190 cho Cty Go Food TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        18907000,
        'thanh toan tien mua nhum cho Nguyen Thi Dang TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - ĐẶNG - LÝ SƠN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        33647400,
        'CTY GREENGOOD THANH TOAN HD1024v1030 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        2047500,
        'CONG TY TNHH DAU TU NTP TT CA NGU 0 410 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        13373640,
        'VIETDELI TT CONG NO BACH TUOC NHAT NCC ECO T09 2025 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CN CT CP TM VÀ DV VIET DELI - NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251015-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        80,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        80000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        49615000,
        'Thanh toán công nợ chị Kim Loan',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        29,
        'Phí gửi tiền ngân hàng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        16994000,
        'TT công nợ anh Tới',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        7964000,
        'TT công nợ chị Phúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        100,
        'Thanh toán tiền ship 5 can dầu chiên',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        448,
        'Trần Quốc Ý thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRẦN QUỐC Ý - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        150,
        'Tiền bán phế liệu',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        40,
        'Mua 1 kẹp chiên chả cá',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        70,
        'Mua 1 thùng nước suối tiếp khách',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        1200000,
        'Nhận 5 thùng sò lông + 3 thùng nhum nguyên con chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        60,
        'Xăng xe máy + căng dây xích xe máy',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        75,
        'Mua 10 cây nhíp làm nhum',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        300,
        'Nhận 2 thùng loin kiếm Thúy gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        100,
        'Gửi 1 thùng cho Lệ sài gòn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        100,
        'Gửi 1 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        205,
        'Mua hộp lá xếp khay hàng sushi',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251015-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        1350000,
        'Lee Minh Heo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251015-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        249680000,
        'Go Food chuyển khoản trả lại tk cá nhân 1 hóa đơn dịch vụ đã trừ thuế, đã unc cho họ (hđ 144)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251015-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-15',
        73717000,
        'Thanh toán bt chị Phạm Thị Lợi TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Sơn'),
        '20251015-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-15',
        900,
        'Baba PQ thanh toán tiền vận chuyển công nơ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251015-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        1290816,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        1200000,
        'Giao hàng Mực Nang sushi Sashimi đông khay (200g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        1882700,
        'Giao hàng Cá Cờ Kiếm Saku + Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR QUANG THẤT - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        1350000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        1800000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        36540.00034722222,
        'Giao hàng Kiếm vỉ nướng + Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg) + Tuna Saku A',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        9073000,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        5092000,
        'Giao hàng Mực Ống',
        NULL,
        get_or_create_partner('MR THIỆU - NHA TRANG (CÁ NHÂN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        14405000,
        'Giao hàng Trứng nhum AB 200g/khay + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        12600000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH DG GROUP (HARU - Q12)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251015-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        2500000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        3550500,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ NGÂN - HÒN XỆN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        5346000,
        'Nhập hàng Nhum nguyên con (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        10080000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        18907160,
        'Nhập hàng Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - ĐẶNG - LÝ SƠN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        22500000,
        'Nhập hàng Nhum nguyên con (đvt: con) + Sò Lông nguyên liệu',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        87180500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        37495000,
        'Nhập hàng Nhum hũ + Sò Lông nguyên liệu + Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-15',
        4154250,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ)',
        NULL,
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251015-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        35245200,
        'thanh toan hoa don 60 cho Vo Thi Y (TT Công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VÕ THỊ Ý - TAM QUAN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        20385000,
        'thanh toan hoa don so 32 cho Tran Thi Dung (TT Công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VẸM - DŨNG  - CR', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        110250000,
        'thanh toan hoa don 61 cho Cty TT Khanh Hoa (TT công nợ Thiệu) (TT Công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC THIỆU - CHỊ TÂM ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        8428500,
        'thanh toan tien mua hang cho Nguyen Thi Hong Son (TT Công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        20000000,
        'thanh toan het hoa don 272 cho cty Viet Organic (TT Công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT VIỆT ORGANIC - TAM QUAN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        2520000,
        'thanh toan phi internet 12 thang bên trại thuê (góp vốn vào Dự án nhum)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        10482360,
        'Y SA BI chuyen tien (Gia Hân tt công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HKD Y SA BI (MS GIA HÂN- TRÀ VINH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        37316185,
        'NGUYEN VAN TAM chuyen tien (Baba PQ tt công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        262164000,
        'thanh toan hoa don 144 cho cty Go Food',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        13909350,
        'HADU thanh toan công nợ cua Cty CP Thuc Pham Eco Organic Nha Trang tha ng 9/2025',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251014-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        2600000,
        'Chị Trinh Q7 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        2600000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        1300000,
        'Anh Hiếu Hn thanh toán công nợ bill nhum 13/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HIẾU - HN (61 BÁT SỨ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        1300000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        3848000,
        'Anh Hiếu vũng tàu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HIẾU- VŨNG TÀU', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        3848000,
        'TT công nợ chị Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        450,
        'Gửi 4 thùng cho DPN + 1 thùng cho khách mới DN A Châu',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        805,
        'Mua 20 bao đá bi ngày 13/10+15 bao đá bi ngày 14/10',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        95,
        'Tiền xe ba gác bé tân chở bt đến xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        1000000,
        'Gửi 4 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        510,
        'Tiền thu gom rác 51 bao',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        200,
        'Nhận 2 thùng sò lông chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251014-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        1950000,
        'Chị Hồng thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS HỒNG- CHỢ MỚI LONG THÀNH ĐỒNG NAI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251014-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        1365000,
        'CT TNHH KAKINOKI (MS PHƯƠNG -SG) tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH KAKINOKI (MS PHƯƠNG -SG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251014-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        800,
        'Thanh toán phí ship kvsg 01-07/10/2025',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251014-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        7772000,
        'TT công nợ cá tươi chị Xuân Phương',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        1814000,
        'TT công nợ cá tươi chị Xuân Phương',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        2900000,
        'TT tiền cho Mr Cường (Cường gắn Lại điện trở cho Lò luộc.. chi phí tổng hết 2.9tr )',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-14',
        6123750,
        'TT lại tiền dư hóa đơn so với thực tế của chị Hương Anh Vũ',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        1683500,
        'Anh Thái hn tt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        252,
        'Anh Long thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LONG - CẦU GIẤY - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251014-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-14',
        6051000,
        'Anh Hợp ĐN thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251014-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        5430800,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251014-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        5544000,
        'Nhập hàng Sò Lông nguyên liệu',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251014-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        12125000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251014-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        27121500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251014-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        2961000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR LONG - CẦU GIẤY - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        2940000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        5984000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        1300000,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR HIẾU - HN (61 BÁT SỨ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        2000000,
        'Giao hàng phí vận chuyển + Tuna Saku A',
        NULL,
        get_or_create_partner('MS CHÂU TO - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        1683500,
        'Giao hàng Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        3255000,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH KIWAMI VN - MR TUẤN - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        448,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR TRẦN QUỐC Ý - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        28247760,
        'Giao hàng Bạch tuộc tako + Chả cá + Mực nang nút 9-10',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        6051000,
        'Giao hàng Tuna Saku A + Bạch Tuộc Tako nhỏ',
        NULL,
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        15500000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        21107200,
        'Giao hàng Tuna loin 3-5 + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        36545.00034722222,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('QUÁN TANAKEI - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        3939000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('KIN SUSHI - LÂM ĐỒNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        11687000,
        'Giao hàng Mực Ống SS khay 200g + Tuna Saku A + Mực Nang sushi Sashimi (160g/ khay) + Mực Ống',
        NULL,
        get_or_create_partner('SUSHI O BA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-14',
        12000000,
        'Giao hàng Mực Nang sushi Sashimi đông khay (200g/ khay)',
        NULL,
        get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251014-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        27012825,
        'CONG TY TNHH SAKURA SUSHI Chuyen khoan hoa don 1009 (công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SAKURA SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251013-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        29461298,
        'CONG TY ONE MORE THANH TOAN TIEN HA NG',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM DV ONE MOREANH (MR TUẤN NGHĨA- ĐÀ NẴNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251013-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        3000000,
        'Ủng hộ thiệt hại bão số 10 cho MTTQ phường Bắc Nha Trang',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        125,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        2375000,
        'Đưa tiền ăn cho cô Dư tuần tiếp theo',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        34200000,
        'Haru thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH DG GROUP (HARU - Q12)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        34200000,
        'TT công nợ chị Hoa hòn rớ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        300,
        'Nhận 3 thùng lườn kiếm ssm chị Phương Dung gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        420,
        'Nhận 3 thùng nang Truyền vũng tàu gửi xe Ngọc Phát',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        9514000,
        'Du thuyền thanh toán công nợ tháng 8',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT CP TẬP ĐOÀN DU THUYỀN- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        1200000,
        'anh Huy yersin thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HUY - YERSIN - NT', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        400,
        'Gửi 4 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        860,
        'Nhận 5 thùng bt chị Lợi gửi + 1thùng a Tới gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        500,
        'Tiền xe a Mãi chở 2 chuyến ốc lên gửi kho chị Minh',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        460,
        'Mua 20 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        750,
        'Gửi 3 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        20674000,
        'Chị Giang cần thơ thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        20674000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        17697000,
        'Uni sushi thanh toán công nợ đến hết 12/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        17697000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251013-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        25000000,
        'TT công nợ chị Phạm thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251013-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        6719918,
        'Anh Thực phú quốc thanh toán công nợ T7 (phần cá nhân)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251013-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        7800000,
        'Chị Trinh Quận 7 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251013-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        1350000,
        'Quán Ốc 88 thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('QUÁN ỐC 88 - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251013-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        2709000,
        'Anh Long thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LONG - CẦU GIẤY - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251013-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-13',
        7800000,
        'Anh Triệt thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRIỆT - TÂY NINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251013-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-13',
        21303000,
        'TT công nợ ncc Phạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251013-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        8428500,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi + Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        9315000,
        'Nhập hàng Nhum nguyên liệu (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        11564000,
        'Nhập hàng Bạch tuộc tươi size 1.5-2kg + Bạch tuộc tươi size 1up + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        12345000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        25635000,
        'Nhập hàng Mực nang nút 9-10 + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        46304000,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        27219000,
        'Nhập hàng Lườn kiếm sashimi + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('NCC LƯỜN KIẾM - CHỊ PHƯƠNG DUNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251013-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        5422725,
        'Giao hàng Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH SAKURA SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        6120000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR HUY - YERSIN - NT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        2435000,
        'Giao hàng Mực Ống + Tuna Saku A + Râu bạch tuộc + Cá Cờ Kiếm Saku + Ngao Bộp Tím nguyên con + Bạch tuộc LSNC 30-50 + Bánh Takoyaki',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        7722400,
        'Giao hàng Trứng Nhum AA 200g/khay + Nhum vụn + Cá Hồng Biển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        19682000,
        'Giao hàng Trứng Nhum AA 200g/khay + Tuna Saku A + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TP NHẬT KOTO (MR KIÊN- HL)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        9280000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR BẮC - TRƯƠNG ĐỊNH, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        13327416,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        1350000,
        'Giao hàng Sò Lông Nửa Mảnh',
        NULL,
        get_or_create_partner('QUÁN ỐC 88 - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        26271210,
        'Giao hàng phí vận chuyển + Bạch tuộc tako + tuna saku + Chả cá + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        11460000,
        'Giao hàng Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        1732500,
        'Giao hàng Trứng nhum tươi',
        NULL,
        get_or_create_partner('CT MARUSEI - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        23628800,
        'Giao hàng Mực Nang 500-800 + Kiếm steak + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        15345000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        3848000,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠI VY (NH MAYONAKA)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        2141000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT KYOTO YAKINIKU - A CHÂU - DN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        10836000,
        'Giao hàng Lườn kiếm sashimi',
        NULL,
        get_or_create_partner('CT THỰC PHẨM NGÀY MỚI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-13',
        7800000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS TRINH- QUẬN 7', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251013-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-12-09 23:54:00',
        40000000,
        'TT công nợ Kim Dung ninh hòa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251012-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-12-09 23:54:00',
        1995000,
        'HanYang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM DV HAN YANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251012-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-12-09 23:54:00',
        750,
        'Gửi 3 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251012-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-12-09 23:54:00',
        300,
        'Nhận 2 thùng bt a Tới gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251012-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-12-09 23:54:00',
        4472000,
        'hs Linh Linh ck trả tiền thừa chênh so với hóa đơn đã unc',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('CT HẢI SẢN LINH LINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251012-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        3211500,
        'Nhập hàng phí vận chuyển + Mực Ống',
        NULL,
        get_or_create_partner('NCC LỢI THU - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251012-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        6664000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251012-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        11904000,
        'Nhập hàng Bạch tuộc tươi + Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251012-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        20937500,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251012-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        22660000,
        'Giao hàng Râu bạch tuộc tươi 150g up + Tuna Saku A + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        28286640,
        'Giao hàng phí vận chuyển + Chả cá + Bạch tuộc tako + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        1270800,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('NH YAKI YUM - NGUYỄN VĂN LỘC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        948.672,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        5425000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        8066000,
        'Giao hàng Râu bạch tuộc + Bạch tuộc mini 8-13 + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        3052000,
        'Giao hàng tuna saku',
        NULL,
        get_or_create_partner('CT TNHH GOLDEN FINE FOODS', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-12-09 23:54:00',
        3250000,
        'Giao hàng Bạch tuộc tako slice (160 gram/khay)',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251012-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        810,
        'MR LEE MINH HEO - HN thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251011-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        3900000,
        'ANH HỢP - ĐÀ NẴNG thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251011-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        260,
        'Mitsubishi Thiết bị điện tự động thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MITSUBITSHI - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251011-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        40000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251011-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        2096000,
        'Tiền điện nước cửa hàng Hn tháng 9/2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        2300000,
        'Hà Dương thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('HÀ DƯƠNG FOODS- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        2300000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        150,
        'Nhận 2 thùng mắm  + 1 thùng tuộc chị Nga phú yên gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        150,
        'Nhận 1 thùng sò lông bình thuận',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        80,
        'Nhận 1 thùng saku Trường gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        100,
        'Xe ba gác nhận bt Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        345,
        'Mua thêm 15 bao đá bi buổi chiều',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        50,
        'Gửi 1 thùng sài gòn cho Lệ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        50,
        'Gửi 1 thùng cho Anh Nhân ĐN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        40000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        29631280,
        'Thanh toán tiền DPN unc dư tháng 9',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        900,
        'Gửi 9 thùng cho DPN tối ngày 10/10',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        26759000,
        'TT công nợ A Tới phú quý',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        630,
        'Đổ xăng xe tải',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        700,
        'Gửi 3 thùng xe cont ra HN cho Phương',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251011-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        1700000,
        'Anh Tiên cần thơ thanh toán công nợ (Sachi)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('ANH TIÊN - CẦN THƠ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251011-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        15000000,
        'TT công nợ ncc Nguyễn Thị Phúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251011-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        1300000,
        'Anh Hải Triều thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẢI TRIỀU - Q10 - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251011-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        1262000,
        'Anh Thêu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THÊU - HN -CS2', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        2522000,
        'Chef Hồng thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CHEF HỒNG - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        2242800,
        'Anh Hạnh Bắc ninh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẠNH- BẮC NINH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        600,
        'Meat Farm thanh toán công nợ (phần vận chuyển)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MEAT FARM', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-11-09 23:54:00',
        124.8,
        'Trả lại tiền cho Hadu (mua đầu cá hồi giúp mr Hải, mr Hải đã ck)',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-11-09 23:54:00',
        520,
        'Ngợi thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS NGỢI - ECO', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251011-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        2335500,
        'Nhập hàng Sò Lông nguyên liệu',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        6099200,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        9771000,
        'Nhập hàng Bạch tuộc tươi + Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        13376000,
        'Nhập hàng Loin kiếm',
        NULL,
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        16400000,
        'Nhập hàng tuna saku',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        23620800,
        'Nhập hàng Sushi mực ống 8g + Mực Nang sushi Sashimi đông khay (200g/ khay) + Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('CT GO FOOD - KIÊN GIANG (MR CÔNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        34090500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        87487000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        31000000,
        'Nhập hàng Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - ĐỖ THỊ ÁNH - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251011-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        750,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT ANH VŨ - HN (C HƯƠNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        2000000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('HKD Y SA BI (MS GIA HÂN- TRÀ VINH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        3341400,
        'Giao hàng Bạch tuộc tako + Tuna Saku A + Cá Cờ Kiếm Saku + Nang roll',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        5301000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT DELMAR VN - (C HƯƠNG VOV)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        810,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        258.3,
        'Giao hàng Cá Chim Vây Vàng',
        NULL,
        get_or_create_partner('MITSUBITSHI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        3900000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR HỢP - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        352,
        'Giao hàng Mùn Cưa',
        NULL,
        get_or_create_partner('MR ĐỊNH- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        1300000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MR HẢI TRIỀU - Q10 - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        1150000,
        'Giao hàng Bạch tuộc LSNC 30-50 + Tuna Saku A',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-11-09 23:54:00',
        3927000,
        'Giao hàng phí vận chuyển + Loin kiếm',
        NULL,
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251011-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        2161800,
        'Mr Hải thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251010-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        41272380,
        'Meat &Fish TT công nợ tháng 9',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MEAT AND FISH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        666.6,
        'ANH THÁI thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251010-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        6350000,
        'Mr Toàn TT Công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TOÀN - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        31093000,
        'Thu Greengood thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        31093000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - Py', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        6350000,
        'TT công nợ Mr Trí chả cá PY',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - Py', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        1700000,
        'Thanh toán công nợ ncc Quanh Bùi nhum đen',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        420,
        'Thanh toán tiền grab A Trãi 6 đơn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        300,
        'Nhận 2 thùng loin kiếm Thúy gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        200,
        'Nhận 1 thùng bt A Tới phú quý gửi (tối ngày 9/10)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        805,
        'Mua 15 bao đá bi ngày 9/10 + 15 bao ngày 10/10',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        200,
        'Nhận 2 thùng nhum nguyên con chị Phúc Bình Thuận về (1600 con)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        160,
        'Nhận 2 thùng tuna saku + kiếm steak Trường gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        120,
        'Mua nhớt máy hck',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        100,
        'Nhận 1 thùng bt A Tới phú quý gửi tối 10/10',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        250,
        'Gửi 1 thùng cho Baba PQ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251010-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        47948760,
        'MEAT FARM chuyen tien công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MEAT FARM', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        539.7,
        'NAGI-ECO-HD1039 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        2782750,
        'CONG TY TNHH SANMARU chuyen tien công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH SANMARU (MR NGỌC- HN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        2828000,
        'GOLDEN FINE FOODS công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH GOLDEN FINE FOODS', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-10-09 23:54:00',
        2351700,
        'thanh toan hd 1124 cho cty Ngoc Hong',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251010-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-10-09 23:54:00',
        50,
        'Nagi thanh toán tiền vận chuyển (công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251010-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        1200000,
        'Giao hàng Mực Nang sushi Sashimi đông khay (200g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        2037000,
        'Giao hàng Bạch tuộc tako + Tuna Saku A + Mực Ống',
        NULL,
        get_or_create_partner('MR HẢI- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        13522950,
        'Giao hàng Tuna Saku XK',
        NULL,
        get_or_create_partner('GOFOOD- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        16683840,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT MARUSEI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        520,
        'Giao hàng Bạch tuộc LSNC 30-50 + Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('MS NGỢI - ECO', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        1625000,
        'Giao hàng Mực Ống + Tuna Saku A + Bạch tuộc LSNC 30-50 + Ngao Bộp Tím nguyên con + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        3866724,
        'Giao hàng Râu bạch tuộc + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        7800000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MR TRIỆT - TÂY NINH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        3440000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        14427500,
        'Giao hàng phí vận chuyển + Bạch tuộc tako + tuna saku',
        NULL,
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        66648100,
        'Giao hàng Mực Nang 500-800 + Tuna loin 3-5 + tuna saku + Chả cá + Sò Lông Nửa Mảnh + Tuna Saku 3A',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251010-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        4800000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251010-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        20020000,
        'Nhập hàng Loin kiếm + Loin kiếm',
        NULL,
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251010-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        10204600,
        'Nhập hàng Bạch tuộc tươi size 1.5-2kg + Bạch tuộc tươi size 1up + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251010-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        65069000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251010-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-10-09 23:54:00',
        12510000,
        'Nhập hàng Nhum nguyên liệu (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251010-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-09-09 23:54:00',
        1774710,
        'CONG TY TNHH DAU TU NTP TT CA NGU 2 509 (anh Tình tt công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251009-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        70,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        50,
        'Nhận 1 thùng nhum Quanh Bùi  gửi (500 con)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        250,
        'Nhận 2 thùng nhum nguyên con chị Phúc Bình Thuận về (1600 con)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        600,
        'Gửi 6 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        200,
        'Gửi 2 thùng cho VietArt',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-09-09 23:54:00',
        400,
        'Tiền xe a Bình chuyển 2 chuyến Ốc từ xưởng lên gửi kho chị Minh',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251009-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        8476650,
        'Giao hàng Tuna Saku XK',
        NULL,
        get_or_create_partner('GOFOOD-SG (CT TNHH FBC SÀI GÒN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        21740000,
        'Giao hàng Nhum vụn + Lườn tuna + Trứng Nhum AA 200g/khay + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        990,
        'Giao hàng Tuna Saku A + Mực Ống',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        1470000,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR BÙI DANH - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        2384340,
        'Giao hàng Loin lườn kiếm',
        NULL,
        get_or_create_partner('CT LÊ GiA (MINORI CS2)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        1400000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT MOO JIN (MS HỒNG ÁNH - SG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        17550000,
        'Giao hàng Tuna đầu đuôi portion',
        NULL,
        get_or_create_partner('CT TNHH SX-TM THIÊN ÂN PHÁT (MR ĐỖ XUÂN-NT)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        666.6,
        'Giao hàng Tuna Saku XK',
        NULL,
        get_or_create_partner('MR THÁI - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        12976000,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako slice (160 gram/khay)',
        NULL,
        get_or_create_partner('CT TNHH MEAT AND FISH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        22320000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH MTV SHIZEN FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        35509000,
        'Giao hàng tuna saku + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('CT TNHH VIETART F&B', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        26645000,
        'Giao hàng Kiếm steak + chả cá hấp + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251009-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        9660000,
        'Nhập hàng Bạch tuộc tươi + Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251009-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        30553500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251009-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        10455800,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251009-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        1760500,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251009-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-09-09 23:54:00',
        4800000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251009-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-09-09 23:54:00',
        1470000,
        'Anh Bùi Danh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR BÙI DANH - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251009-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        9450000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        100000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        15330000,
        'TT công nợ chị Kim Loan bt ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        22,
        'Phí gửi tiền chị Kim Loan',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        31000000,
        'TT công nợ chị Đỗ Thị Ánh',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - ĐỖ THỊ ÁNH - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        22,
        'Phí gửi tiền chị Ánh',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        7225000,
        'TT công nợ chị Nguyễn Thị PHúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        5684000,
        'TT công nợ chị Trang hòn xện (40,6kg*140k)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        9750000,
        'Newfresh thanh toán công nợ T8',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH NEW FRESH FOODS', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        9750000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        5684000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251008-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        31659450,
        'Cty TP Phu Quoc TT Công Nợ T9.2025 Cty V GVINA',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251008-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        100000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251008-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        2091500,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('CT TNHH PGF ASIA- HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        2580100,
        'Giao hàng Tuna Saku A + Nang roll + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        1350000,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH KAKINOKI (MS PHƯƠNG -SG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        48548760,
        'Giao hàng phí vận chuyển + Bạch Tuộc Tako nhỏ + Bạch tuộc tako + Râu Tako A',
        NULL,
        get_or_create_partner('CT TNHH MEAT FARM', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        6252500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CN CT CP TM VÀ DV VIET DELI - NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        3111000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT CP TẬP ĐOÀN DU THUYỀN- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        27350568,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        4471200,
        'Giao hàng Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        3862000,
        'Giao hàng phí vận chuyển + Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        1262000,
        'Giao hàng Tuna Saku A + Râu bạch tuộc',
        NULL,
        get_or_create_partner('MR THÊU - HN -CS2', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        1700000,
        'Giao hàng Trứng nhum AA 100g/khay',
        NULL,
        get_or_create_partner('ANH TIÊN - CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        4042500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR THỦY- NGHỆ AN (FUJIMO)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        130200000,
        'ShiZEN FOOD) CTY SHIZEN FOOD TT TIEN TRUNG NHUM, HD 955 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV SHIZEN FOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251008-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        22898400,
        'Umeyaki thanh toan ca kiem công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251008-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        19162500,
        'VinRoll ck Ca Ngu công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM DV VINROLL VN ( MR PHÚC- THỦ ĐỨC)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251008-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        2309000,
        'Anh Lộc đồng nai thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('ANH LỘC - ĐÔNG NAI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        2309000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - Py', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        5878000,
        'Định thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐỊNH- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        5878000,
        'TT công nợ chả cá Trí',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - Py', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        18819000,
        'Phú thịnh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        18819000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        700,
        'Gửi 3 thùng tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        300,
        'Nhận 3 thùng nhum nguyên con Bình THuận',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        250,
        'Gửi 1 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        200,
        'Xe ba gác chở bt Bé Tân đến xưởng (chiều 1 chuyến + tối 1 chuyến)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        1035000,
        'Mua 15 bao đá bi ngày 6/10 +15 bao ngày 7/10 + 15 bao ngày 8/10',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        450,
        'Gửi 3 thùng DPN + 1 thùng c Hằng + 1 thùng A Nhân ĐN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        400,
        'Nhận 1 thùng bt a Tới gửi + 1 thùng nhum Đỗ thị Ánh gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        1710000,
        'TT công nợ chị Nguyễn Thị Thu bt',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NGUYỄN THỊ THU - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251008-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        9312500,
        'Chị Hằng Totoro thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH DV TOTORO VN (MS HẰNG - ĐÀ NẴNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251008-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        10261500,
        'Anh Nam la thành thanh toán công nợ phần cá nhân',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251008-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        1950000,
        'Anh Đông phú quốc thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251008-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        960,
        'Anh Nhân The View thanh toán công nợ t8',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH UMEYAKIA (MR NHÂN- THE VIEW ĐÀ NẴNG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251008-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        34875000,
        'SH Foods tt bill 27/9 công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TM TP SH (SH FOODS)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251008-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        12514500,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi + Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251008-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        14000000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251008-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        14750000,
        'Giao hàng Trứng Nhum AA 200g/khay+Râu bạch tuộc',
        NULL,
        get_or_create_partner('CT TNHH NEW FRESH FOODS', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        24017500,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251008-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        5400000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251008-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        2600000,
        'Chị Lì SG thanh toán công nợ ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS LÌ - SÀI GÒN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251008-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        4042500,
        'Anh Thủy- Nghệ An tt hết công nợ T8/25',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THỦY- NGHỆ AN (FUJIMO)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251008-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-08-09 23:54:00',
        1800000,
        '81/2 hoàng diệu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251008-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-08-09 23:54:00',
        10074000,
        'TT công nợ ncc cá tươi chị Xuân Phương (22-29/9)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251008-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-08-09 23:54:00',
        2522000,
        'Giao hàng Cá Bè (Cá Khế, Cá Giấy, cá viễn)',
        NULL,
        get_or_create_partner('CHEF HỒNG - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251008-057'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        15531000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        10527840,
        'Giao hàng Bạch tuộc tako + RÂU + VAT',
        NULL,
        get_or_create_partner('CT TNHH MTV TM NAM ANH FOODS (MR VINH- ĐÀ NẴNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        10351500,
        'Giao hàng Loin lườn kiếm + Mực Nang sushi Sashimi đông khay (200g/ khay)',
        NULL,
        get_or_create_partner('HKD SUSHITO (NHÀ KHO)- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        16227000,
        'Giao hàng Tuna Saku',
        NULL,
        get_or_create_partner('CT TNHH VIETART F&B', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        500,
        'Giao hàng Râu bạch tuộc + Bánh Takoyaki',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        15097000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH TP NHẬT KOTO (MR KIÊN- HL)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        2754000,
        'Giao hàng phí vận chuyển + Lườn kiếm nướng',
        NULL,
        get_or_create_partner('CT 138 ENT (LẨU CÁ THANH ĐA) - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        1550000,
        'Giao hàng phí vận chuyển + Trứng nhum AA 100g/khay',
        NULL,
        get_or_create_partner('SS IKUSACHI- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        17217500,
        'Giao hàng Chả cá + phí vận chuyển + Bạch tuộc tako + Tuna loin 3-5',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        2309000,
        'Giao hàng Trứng Nhum AA 200g/khay + Mực Nang sushi Sashimi (160g/ khay) + Tuna Saku A',
        NULL,
        get_or_create_partner('ANH LỘC - ĐÔNG NAI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        564,
        'Giao hàng phí vận chuyển + Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('NH NAGI 2 - GÒ VẤP', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        1777000,
        'Giao hàng phí vận chuyển + Tuna Saku XK + Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH MTV ISHIGA (PHIPHI SS)- ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        4719600,
        'Giao hàng phí vận chuyển + Chả cá + Kiếm steak',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        39114800,
        'Giao hàng Chả cá + Kiếm steak + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251007-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        4950000,
        'Nhập hàng Nhum nguyên con (đvt: con) + Sò Lông NL',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251007-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        33840000,
        'Nhập hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251007-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-07-09 23:54:00',
        43188000,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi size 1up',
        NULL,
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251007-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        60000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        49669500,
        'TT công nợ Kim Dung ninh hòa (hết T9/2025)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        56082600,
        'TT công nợ Hoàn Truyền hd 263',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        83700000,
        'TT công nợ Tuyết Sương (hết hđ số 2, 1 phần công nợ t8)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        24462000,
        'TT công nợ Vẹm Dũng cr hđ 30',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VẸM - DŨNG  - CR', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        39296250,
        'TT công nợ Trường Thảo T9,2025 hđ 654',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        115000000,
        'TT công nợ Thiệu (unc nốt hđ 199 cho Viet Tuna Vy)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC THIỆU - CHỊ TÂM ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        10330000,
        'TT công nợ Son ninh hòa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        52111525,
        'TT công nợ Viet Organic (lần 2 hđ 272)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT VIỆT ORGANIC - TAM QUAN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        6588000,
        'Tiền mua băng keo bách lưới từ 22/8-7/10 hđ 90',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        1210000,
        'thanh toan hoa don 2639 cho cty Phuong Nam',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-09 23:54:00',
        205388787,
        'CTY NGUYEN PHUONG TT công nợ TIEN HANG T9 2025',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251007-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-09 23:54:00',
        60000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        20639000,
        'TT công nợ anh Tới 5+6/10',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        248,
        'Mua đồ cúng',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-09 23:54:00',
        3654000,
        'Hải sản xanh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH XK & NK AN PHÚ (HSX 55 MỄ TRÌ)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        3654000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-09 23:54:00',
        2600000,
        'Chị Thanh Thảo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        2600000,
        'TT công nợ chị Hoa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        33840000,
        'TT công nợ cô Thủy lấy 3 thùng nhum',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        800,
        'Đổ xăng xe tải',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        600,
        'Thanh toán tiền thu gom rác 60 bao',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        1400000,
        'Gửi 5 thùng tài thắng cho Phương Hn (có 4 thùng ghép nối cao thêm)',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        500,
        'Gửi 2 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        300,
        'Nhận 3 thùng nhum nguyên con Bình Thuận',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        250,
        'Sửa 2 cân',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        650,
        'Gửi 6 thùng DPN + 1 thùng cho Phiphi sushi DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        150,
        'Gửi 1 thùng vạn quang vĩnh long',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        1200000,
        'Hoa hồng anh Khanh Hadu T8,2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        144,
        'Hoa hồng Bùi Văn Tuấn NT T9,2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        2251725,
        'Tiền nước xưởng T9,2025',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        1150000,
        'Hoa hồng nhà hàng NBQN T8,2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        980,
        'Hoa hồng anh Hùng (khách cty Lyntime T8,2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        500,
        'Chiết khấu doanh thu Đảo HS tháng 8,2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-07-09 23:54:00',
        300,
        'Bách lưới nha trang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-07-09 23:54:00',
        180,
        'Mua 1 thùng nhựa xanh ở bách lưới',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251007-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        80000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251006-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        7492272,
        'sushi tiger thanh toan cong no SAKA NA thang 9 (anh Nam la thành thanh toán công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251006-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        4003125,
        'Madison alnd TT mua thuc pham cho outlet T08.25 (thanh toán công nợ)',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT MADISON LAND HỒ TRÀM', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251006-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        560,
        'Nhận 4 thùng nang Truyền vũng tàu gửi xe ngọc phát',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        1680000,
        'Nhận 8 thùng nang HS Linh Linh gửi bx phía nam',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        130,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        15,
        'Gửi hợp đồng cho Đông phương',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        80000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        40022000,
        'Gửi tiền vào tk Phạm Thị Lợi để mua bạch tuộc + phí 22k (TT công nợ)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        300,
        'Xăng xe tải',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        15,
        'Xe vào bến phía nam nhận nang',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        7459000,
        'Lương T9 của Trần Mỹ Lệ',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        3901000,
        'Lương T9 của Phương (phần cá nhân)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        2395000,
        'Thanh toán phí vc kvhn cho Phương: 22-30/09/2025',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        9608921,
        'Lương + tiền chạy quảng cáo T9 của Trâm Anh sale',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        5000000,
        'Tiền cơ động tháng 9/2025',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        200,
        'Thu tiền bán phế liệu',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        5874000,
        'Giao hàng Râu bạch tuộc + Tuna Saku A',
        NULL,
        get_or_create_partner('MR ĐỊNH- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        9544500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        9090000,
        'Giao hàng Trứng Nhum AA 200g/khay + Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH TP NHẬT KOTO (MR KIÊN- HL)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1102500,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1732500,
        'Giao hàng Trứng nhum tươi',
        NULL,
        get_or_create_partner('CT MARUSEI - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        13374000,
        'Giao hàng phí vận chuyển + Cá Cờ Kiếm Saku + Tuna Saku A',
        NULL,
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        248,
        'Giao hàng sụn xương cá kiếm',
        NULL,
        get_or_create_partner('MR HOÀNG - NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1050000,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('MR DUY - VĂN CAO, HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1050000,
        'Giao hàng phí vận chuyển + Chả cá',
        NULL,
        get_or_create_partner('MR TRÌNH - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1950000,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('MR ĐÔNG - PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        14013670,
        'Giao hàng phí vận chuyển + Bạch tuộc tako + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        2032000,
        'Giao hàng Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg) + Cá Cờ Kiếm Saku + Tuna Saku A + Bạch tuộc LSNC 30-50 + Tôm Thẻ Lột + Ngao Bộp Tím nguyên con',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        5422725,
        'Giao hàng Tuna Saku A + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('CT TNHH SAKURA SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        1800000,
        'Giao hàng Râu bạch tuộc',
        NULL,
        get_or_create_partner('MS MINH TRANG- 81/2 HOÀNG DIỆU, NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        24891408,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS THANH THẢO- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        3654000,
        'Giao hàng Chả cá',
        NULL,
        get_or_create_partner('CT TNHH XK & NK AN PHÚ (HSX 55 MỄ TRÌ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        3382500,
        'Giao hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251006-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        36588.00034722222,
        'Nhập hàng Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        10330500,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi + Nhum hũ',
        NULL,
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        15330000,
        'Nhập hàng Bạch tuộc tươi size 0.5-1kg + Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        7206800,
        'Nhập hàng Bạch tuộc tươi size 1up + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        31160000,
        'Nhập hàng Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT HOÀN TRUYỀN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        73637475,
        'Nhập hàng VAT + Mực Nang 500-800',
        NULL,
        get_or_create_partner('CT HẢI SẢN LINH LINH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        1050000,
        'Mr Trình thanh toán công nợ bill 6/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRÌNH - SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        1050000,
        'TT công nợ bt chị Phạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        65828000,
        'Thiên Trang thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        65828000,
        'TT công nợ chị Hoa hòn rớ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        4000000,
        'TT công nợ chị Trang hòn xện',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        2138000,
        'TT công nợ chị Phạm Thị Lợi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC PHẠM THỊ LỢI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        2260000,
        'Đưa cô Dư tiền đi chợ tuần tiếp theo',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        260,
        'Đóng tiền internet kv HN tháng 9/2025',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        120,
        'Nhận 1 thùng nhum nguyên con chị Phúc gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        600,
        'Nhận 4 thùng bt Phạm Thị Lợi gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        100,
        'Gửi 1 thùng sài gòn cho Lệ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        200,
        'Gửi 2 thùng DPN + VietArt',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-06-09 23:54:00',
        250,
        'Gửi 1 thùng cho Vạn Quang Phú Quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251006-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        1552000,
        'NH KYOBASHI IZAKAYA- SG thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH KYOBASHI IZAKAYA- SG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251006-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        1955000,
        'Mr Hoàn ck trả lại tiền lương dư so với thực tế (unc)',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Mr. Hoàn', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251006-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        36584.00034722222,
        'sushi graden  TT công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SS GARDEN NGUYỄN TRÃI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251006-057'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        1440000,
        'sushi graden nguyễn văn lộc TT công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SS GARDEN- NGUYỄN VĂN LỘC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251006-058'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        2210000,
        'Mai trinh ck TT công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251006-059'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        456.75,
        'Em tuân HN TT công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TUÂN - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251006-060'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-06-09 23:54:00',
        2457000,
        'Anh Hùng Mai Hắc đế thanh toán bill  TT công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR HÙNG- MAI HẮC ĐẾ - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251006-061'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-06-09 23:54:00',
        2275000,
        'Nhập hàng Nhum nguyên con (đvt: con) + Sò Lông Nửa Mảnh',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251006-062'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        2800000,
        'Nhận 13 thùng cá tươi bãi Vũ Mập',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        820,
        'Thanh toán tiền grab anh Trãi: giao 15 thùng Ocean Link việt nhật + 1 thùng A Toàn DN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        320,
        'Mua 8 hộp găng tay y tế xưởng dùng',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        500,
        'Gửi 2 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        900,
        'Gửi 9 thùng cho DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        220,
        'Nhận 1 thùng bt a Tới phú quý gửi bãi Ông Tư (sáng)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        100,
        'Xe ba gác chở bt Bé Tân đến xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        500,
        'Gửi 2 thùng cho Vạn Quang phú quốc',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        150,
        'Tiền ăn trưa 5 người làm chủ nhật',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        150,
        'Gửi 1 thùng cho chị Giang cần thơ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        150,
        'Nhận 1 thùng bt a Tới phú quý gửi (nhận tối)',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251005-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        1601000,
        'Thanh toán phí ship kvsg 22-30/09/2025',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Lệ'),
        '20251005-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        110,
        'Thu phí home banking',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Techcombank', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251005-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-05-09 23:54:00',
        492471900,
        'DPN thanh toán công nợ tháng 9',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251005-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        12000000,
        'UNC tiền thuê trại nuôi (tính vào tiền cổ phần của Eco vào dự án nuôi nhum) - 1 năm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251005-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        75000000,
        'UNC tiền mua lại cơ sở vật chất ở trại (tính vào tiền cổ phần của Eco vào dự án nuôi nhum) - 1 năm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251005-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-05-09 23:54:00',
        78108975,
        'thanh toan HD 478 cho CTY HS Linh Linh TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('CT HẢI SẢN LINH LINH', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251005-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        13891500,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH GINKAKU ( MS THIÊN TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251005-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        47553700,
        'Giao hàng tuna saku + Nhum nguyên con (đvt: con) + Kiếm steak + Mực Nang 500-800 + Mực nang lớn + Trứng nhum AB 200g/khay + chả cá hấp + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251005-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        11160000,
        'Nhập hàng chả cá hấp',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - TRÍ - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        11352000,
        'Nhập hàng Bạch tuộc tươi + Nhum nguyên liệu (đvt: con)',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        13243000,
        'Nhập hàng Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        13432400,
        'Nhập hàng Bạch tuộc tươi size 1.5-2kg + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi size 1up + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        36102000,
        'Nhập hàng Tuna loin tươi',
        NULL,
        get_or_create_partner('NCC VÕ THỊ Ý - TAM QUAN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-05-09 23:54:00',
        71715100,
        'Nhập hàng Kiếm Nguyên Con + Tuna loin tươi',
        NULL,
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251005-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        2783000,
        'Nhập hàng Cá Hồng Biển + Cá Tai + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('NCC CÁ TƯƠI - CHỊ XUÂN PHƯƠNG - QN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        52080000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        37422000,
        'Nhập hàng Tuna loin tươi',
        NULL,
        get_or_create_partner('NCC VÕ THỊ Ý - TAM QUAN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        43758000,
        'Nhập hàng Tuna loin tươi',
        NULL,
        get_or_create_partner('CT DƯƠNG TUẤN PHÁT - TAM QUAN (THÚY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        35772000,
        'Nhập hàng Tuna loin tươi',
        NULL,
        get_or_create_partner('CT VIỆT ORGANIC - TAM QUAN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10925000,
        'Lương T09 của Hoàn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10201250,
        'Lương T09 của Sơn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10201250,
        'Lương T09 của Sa',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10201250,
        'Lương T09 của Trang',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10201250,
        'Lương T09 của Mỹ Hiền',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        10201250,
        'Lương T09 của Ngợi',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        9701250,
        'Lương T09 của Phương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        9701250,
        'Lương T09 của Trung',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        9701250,
        'Lương T09 của Vương',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251004-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        740,
        'Lương T9 Trung (phần cá nhân)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        8150000,
        'Lương T9 Duyên',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        7669000,
        'Lương T9 Ly',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        6508000,
        'Lương T9 Lý',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        679,
        'Lương T9 Vương (phần cá nhân)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        7000000,
        'Lương T9 Khang',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        7920000,
        'Lương T9 Thiện Chí',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        6625000,
        'Lương T9 Dư',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        6044000,
        'Lương T9 Thảo',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        5881000,
        'Lương T9 Phượng',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        5153000,
        'Lương T9 Hiền',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        5642000,
        'Lương T9 Nở',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        5736000,
        'Lương T9 Luyến',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        3460000,
        'Lương T9 Thủy',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        5529000,
        'Lương T9 Thy',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        4888000,
        'Lương T9 Bình',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        3259000,
        'Lương T9 Hồng',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        7098000,
        'Lương T9 Tuấn',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        4073000,
        'Lương T9 Sơn (phần cá nhân)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        2472000,
        'Lương T9 Sa (phần cá nhân)',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        1201000,
        'Mỹ Hiền ck lại phần dư lương ck so với thực tế',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        2285000,
        'Trang thanh toán lại phần dư lương ck so với thực tế',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        5000000,
        'Ri sushi thanh toán nốt công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR RI SISHI (MR PHÚC SUSHI)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251004-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        15000000,
        'TT công nợ bt chị Trang hòn xện',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251004-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        8000000,
        'TT công nợ bt chị Trang hòn xện',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Linh'),
        '20251004-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        25080000,
        'TT công nợ bt chị Trang hòn xện',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ TRANG - HÒN XỆN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251004-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        5663000,
        'Trần thanh hoàn thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TRẦN THANH HOÀN- ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251004-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        404,
        'Ngợi thanh toán lại khoản lương ck dư so với lương thực tế',
        get_or_create_txn_category('Lương thưởng', 'INCOME'),
        get_or_create_partner('Khác', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251004-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        2047500,
        'Giao hàng Tuna Saku A',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        1810000,
        'Giao hàng Ngao Bộp Tím nguyên con + Râu bạch tuộc + Tuna Saku A + Bạch tuộc LSNC 30-50 + Bánh Takoyaki',
        NULL,
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        5679975,
        'Giao hàng Cá Cờ Kiếm Saku + tuna saku',
        NULL,
        get_or_create_partner('CT CP QL KS VÀ KND LYNN TIMES (MR ĐINH ĐỒNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        1080000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-04-09 23:54:00',
        1080000,
        'Anh Lee Heo thanh toán công nợ bill 04/10',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251004-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        2838000,
        'Giao hàng Cá Tai',
        NULL,
        get_or_create_partner('MR VÕ CẢNH-HCM', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        1552000,
        'Giao hàng Cá Hồng Biển',
        NULL,
        get_or_create_partner('NH KYOBASHI IZAKAYA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-050'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        475.6,
        'Giao hàng Cá Cờ Kiếm Saku + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('NH SUSHI MINH - SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-051'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        2627100,
        'Giao hàng Cá Cờ Kiếm Saku + Bạch tuộc tako + Tuna Saku A + Nang roll',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-052'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        14857500,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako + Phí Vận Chuyển + tuna saku',
        NULL,
        get_or_create_partner('NH BABABA-PHÚ QUỐC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251004-053'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        1950000,
        'Nhận 9 thùng cá tươi bãi Vũ Mập',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-054'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-04-09 23:54:00',
        250,
        'Gửi 1 thùng cho Baba PQ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251004-055'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-04-09 23:54:00',
        2092500,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ NGÂN - HÒN XỆN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251004-056'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        5816124,
        'Giao hàng Râu bạch tuộc + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        1602000,
        'Giao hàng Nhum vụn + Cá Hồng Biển',
        NULL,
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        700,
        'Giao hàng sụn xương cá kiếm',
        NULL,
        get_or_create_partner('CT TNHH SX-TM THIÊN ÂN PHÁT (MR ĐỖ XUÂN-NT)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        4457200,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi size 1up',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        8577000,
        'Giao hàng Rẻo cá cờ kiếm + Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR TRƯỜNG SSM - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        2186000,
        'Giao hàng Bạch Tuộc Tako nhỏ + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('MS MAI TRINH- ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        15407000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        28274100,
        'Giao hàng Mực Nang 500-800 + Tuna loin 3-5 + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        244500000,
        'Giao hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('CT TNHH OCEAN LINK VIỆT NHẬT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251003-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        10766000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC CHỊ HỒNG CHÂU - HÒN RỚ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        1800000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        34120000,
        'Nhập hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        22999200,
        'Nhập hàng Trứng nhum AB 200g/khay + Trứng nhum AB 200g/khay',
        NULL,
        get_or_create_partner('NCC NHUM - ĐỖ THỊ ÁNH - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        43459500,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ)',
        NULL,
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251003-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        140000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-09 23:54:00',
        140000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        23020000,
        'TT công nợ Gửi tiền vào tk Ngọc Anh mua nhum + phí 22k',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - ĐỖ THỊ ÁNH - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        34142000,
        'TT công nợ Gửi tiền vào tk Kim Loan mua nhum + phí 22k',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - KIM LOAN - NINH THUẬN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        250,
        'Gửi 1 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-09 23:54:00',
        390,
        'Thiệu thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THIỆU - NHA TRANG (CÁ NHÂN)', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251003-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-03-09 23:54:00',
        375,
        'Mr Đại thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR ĐẠI- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251003-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        14246800,
        'TT công nợ Thanh toán bt a Tới',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251003-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        350,
        'Nhận 5 thùng nhum Lý Sơn',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        50,
        'Xăng xe máy',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        1850000,
        'Gửi 19 thùng cho DPN, Ocean Link, Mai Trinh ĐN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        15025500,
        'Liên Việt Japan ( URCHIN) thanh toán công nợ',
        NULL,
        get_or_create_partner('CT LIÊN VIỆT', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        12651000,
        'TT công nợ tien mua hang cho Nguyen Thi Hong Son',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        62384000,
        'thanh toan hoa don 54 cho Vo Thi Y TT công nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VÕ THỊ Ý - TAM QUAN', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        8370000,
        'VO GIA thanh toán công nợ HD 971 CHO CTY ECO',
        NULL,
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        2047500,
        'NTP TT CA NGU 2 909 (anh Tình thanh toán công nợ)',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        2047500,
        'NTP TT CA NGU 2 909 (anh Tình thanh toán công nợ)',
        NULL,
        get_or_create_partner('CT TNHH ĐT NGỌC THỊNH PHÁT (MR TÌNH)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251003-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        19823000,
        'Chị Giang cần thơ thanh toán công nợ',
        NULL,
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        19823000,
        'TT công nợ chị Hoa hòn rớ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ HOA - HÒN RỚ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        4375000,
        'Tako ika thanh toán công nợ',
        NULL,
        get_or_create_partner('NH TAKO IKA- SG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251003-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        4375000,
        'TT công nợ bé tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251003-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-03-09 23:54:00',
        7781000,
        'Võ Gia anh Thống tt công nợ phần ck cá nhân',
        NULL,
        get_or_create_partner('CT TNHH TM THỰC PHẨM VÕ GIA (MR THỐNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251003-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        7781000,
        'TT công nợ bé tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251003-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        1800000,
        'TT công nợ Nguyễn thị phúc',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - NGUYỄN THỊ PHÚC', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251003-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-03-09 23:54:00',
        27475000,
        'TT công nợ chị Gái vĩnh trường là hết nợ',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC CHỊ GÁI - VĨNH TRƯỜNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251003-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        3600000,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('CT CP DV TM HADU', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        8544000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('MR LƯỢNG - BẮC NINH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        766,
        'Giao hàng Hàu Nhật Hyogo đông lạnh nguyên vỏ size M (9-11 con/kg) + Bạch tuộc LSNC 30-50 + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('NH Uni Sushi', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        16342560,
        'Giao hàng Bạch tuộc tako + Bạch tuộc tako',
        NULL,
        get_or_create_partner('CT TNHH NGUYÊN PHƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        4963875,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH MTV TM DV HH TP PHÚ QUỐC (ANH THỰC-PQ)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        18819000,
        'Giao hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('CT TNHH ĐT TS PHÚ THỊNH', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        2600000,
        'Giao hàng Tako mix',
        NULL,
        get_or_create_partner('MS LÌ - SÀI GÒN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        7300000,
        'Giao hàng Tuna Saku A + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('MS GIANG- CẦN THƠ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        33601000,
        'Giao hàng Mực Nang Lớn + Chả cá',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251002-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        60000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'EXPENSE'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        23520890,
        'Cong ty co phan thuc pham eco organic nha trang PQ09000856784 thanh toan tien dien ky thang 09.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        21776196,
        'Cong ty co phan thuc pham eco organic nha trang PQ09000853144 thanh toan tien dien ky thang  09.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        202,
        'Cty CP TP ECO ORGANIC NT KHA-01-0037650 THANH TOAN CUOC PHI internet va dt ban THANG 09.2025',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        13760000,
        'cong ty co phan thuc pham eco organic nha trang TZ1158Z nop tien bhxh thang 09.2025',
        get_or_create_txn_category('Lương thưởng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        22515000,
        'TT công nợ hoa don 29 cho Tran Thi Dung',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VẸM - DŨNG  - CR', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        50871000,
        'TT công nợ thanh toan tien mua hang cho Nguyen Thi Kim Dung',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251002-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-02-09 23:54:00',
        60000000,
        'Rút tiền tk công ty',
        get_or_create_txn_category('Chuyển nội bộ', 'INCOME'),
        get_or_create_partner('Nội Bộ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        33840000,
        'TT công nợ Mua 3 thùng nhum cô Thủy: 940k*3*12',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        200,
        'Nhận 1 thùng nhum + 1 thùng bt của Nguyễn Thị Thu phan thiết ngày 1/10',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NGUYỄN THỊ THU - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        250,
        'Gửi 1 thùng xe tài thắng cho Phương HN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        20,
        'Gửi 1 thùng khay nhum cho Sen Ninh Hòa',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        100,
        'Nhận 1 thùng bt a Tới phú quý gửi nhận chiều 3/10',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        120,
        'Nhận 1 thùng nhum đen nguyên con xe Kim Đô',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        500,
        'Gửi 5 thùng DPN',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        100,
        'Gửi 1 thùng c Giang cần thơ',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        1400000,
        'Thanh toán tiền cước xe lạnh nhận vẹm đen tại Lê Công sài gòn chuyển về xưởng',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        4200028,
        'Mua 28 hộp bánh trung thu cho xưởng',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251002-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        1600000,
        'TT công nợ Thanh toán tiền nhum đen cho Bùi Thị Quanh: 400 con *4k',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251002-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-02-09 23:54:00',
        5000000,
        'Tạm ứng cho MR Hoàn',
        get_or_create_txn_category('Tạm ứng', 'EXPENSE'),
        get_or_create_partner('Mr. Hoàn', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251002-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        10200000,
        'Nhập hàng Kiếm steak',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251002-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-02-09 23:54:00',
        967,
        'Uni thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('NH UNI SUSHI', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251002-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        9789600,
        'Nhập hàng Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi size 1up + Bạch tuộc tươi size 0.5-1kg',
        NULL,
        get_or_create_partner('NCC BT - ANH TỚI - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251002-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        12651000,
        'Nhập hàng Nhum hũ + Bạch tuộc tươi + Bạch tuộc tươi (hàng đỏ) + Bạch tuộc tươi size 1up',
        NULL,
        get_or_create_partner('NCC NHUM - SON - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251002-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        20850000,
        'Nhập hàng Nhum nguyên liệu (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251002-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-02-09 23:54:00',
        33840000,
        'Nhập hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('HOÀNG THỊ THÚY - HÒN RỚ (CÔ THỦY)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251002-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        104.602,
        'Tra lai so du tren tai khoan - thang 09/2025',
        get_or_create_txn_category('Doanh thu khác', 'INCOME'),
        get_or_create_partner('Techcombank', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251001-001'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        16606080,
        'CTY GREENGOO THANH TOAN công nợ HD982',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT GREENGOOD', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251001-002'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        39905460,
        'TT công nợ tien mua hang cho CTY Le Cong',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC VẸM ĐEN - LÊ CÔNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251001-003'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        35,
        'Mua đồ đơm',
        get_or_create_txn_category('Chi phí khác', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-004'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        680,
        'Tiền hoa hồng bếp trưởng buzza tháng 7/2025',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-005'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        480,
        'Thanh toán tiền grab anh Trãi: giao 4 đơn: 2 lần VietArt + 1 thùng a Nhân + 1 thùng a Nghĩa + 200k tiền phí vận chuyển a Trãi trả cho thùng hàng saku kiếm gửi từ sài gòn về đà nẵng cho VietArt',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-006'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        10093000,
        'Giao hàng Cá Cờ Kiếm Saku + tuna saku',
        NULL,
        get_or_create_partner('CT TNHH VIETART F&B', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-007'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1552000,
        'Giao hàng Râu bạch tuộc + Tôm Thẻ Lột + Bánh Takoyaki + Tuna Saku A',
        NULL,
        get_or_create_partner('NH Uni Sushi', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-008'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        4300000,
        'Giao hàng Vẹm Xanh Tách Vỏ ( PE)',
        NULL,
        get_or_create_partner('CT TNHH SƠN MAI VỊ BIỂN (MR NGỌC-NHA TRANG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-009'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        3411000,
        'Giao hàng Tuna Saku A + Cá Cờ Kiếm Saku',
        NULL,
        get_or_create_partner('MR THIÊN SS- NHA TRANG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-010'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        540,
        'Giao hàng Trứng Nhum AA 200g/khay',
        NULL,
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-011'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        2280800,
        'Giao hàng Bạch tuộc tako + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('MS TUYỀN- THỦ ĐỨC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-012'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1314000,
        'Giao hàng Bạch tuộc tako',
        NULL,
        get_or_create_partner('NH YAKI YUM - NGUYỄN VĂN LỘC', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-013'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1102500,
        'Giao hàng Mực Nang sushi Sashimi (160g/ khay)',
        NULL,
        get_or_create_partner('CT TNHH TISM & CO ( MR NAM- LA THÀNH,HN)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-014'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1881600,
        'Giao hàng Loin lườn kiếm',
        NULL,
        get_or_create_partner('CT LÊ GIA (MINORI CS2)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-015'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        3394500,
        'A Thiên sushi thanh toán công nợ tháng 7',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR THIÊN SS- NHA TRANG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-016'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        3394500,
        'TT công nợ bé tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-017'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        4640000,
        'Chị Tuyền thủ đức thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS TUYỀN- THỦ ĐỨC', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-018'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        4640000,
        'TT công nợ bé tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-019'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        12552000,
        'Sushi O Ba thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SUSHI O BA', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-020'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        12552000,
        'TT công nợ bé tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-021'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        4350000,
        'Bà Minh Hà Tĩnh thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('BÀ MINH- HÀ TĨNH', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251001-022'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        1600000,
        'A Giang vạn giã thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('Mr GIANG- VẠN GIÃ', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ni'),
        '20251001-023'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        2640000,
        'Hoa hồng Ngọc Trâm đông phương: 880kg tako *3k',
        get_or_create_txn_category('Hoa hồng', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tk Ngợi'),
        '20251001-024'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        3240000,
        'Nhập hàng Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-025'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1600000,
        'Nhập hàng Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('NCC NHUM ĐEN - QUANH BÙI', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-026'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        6350000,
        'Anh Toàn DN thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR TOÀN - ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Dung'),
        '20251001-027'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        5242500,
        'Giao hàng Kiếm steak + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('CT TNHH VẠN QUANG FOOD', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-028'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        6350000,
        'Giao hàng Trứng Nhum AA 200g/khay + Phí Vận Chuyển',
        NULL,
        get_or_create_partner('MR TOÀN - ĐÀ NẴNG', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-029'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        10360000,
        'Giao hàng Chả cá + Nhum nguyên con (đvt: con)',
        NULL,
        get_or_create_partner('CT TNHH MTV ĐẠT PHÚ NGUYÊN', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-030'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        1951500,
        'Giao hàng Bạch tuộc tako + Tuna Saku A + Nang roll',
        NULL,
        get_or_create_partner('CT TNHH NH NAM SAN F&B (SUSHI NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-031'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        589.8,
        'Giao hàng Bạch tuộc tako + Tuna Saku A',
        NULL,
        get_or_create_partner('MR THUẬN- SG (NOWZOON)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK KN'),
        '20251001-032'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        18651000,
        'Nhập hàng Nhum nguyên liệu (đvt: con) + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC KIM DUNG - NINH HÒA', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-033'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        20160000,
        'Nhập hàng Chả cá',
        NULL,
        get_or_create_partner('NCC CHẢ CÁ - CHỊ TUYẾT SƯƠNG - PY', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-034'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        15802000,
        'Nhập hàng Nhum hũ + Bạch tuộc tươi',
        NULL,
        get_or_create_partner('NCC NGUYỄN THỊ THU - PHÚ QUÝ', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-035'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INTERNAL_TRANSFER',
        '2025-01-09 23:54:00',
        8500000,
        'Nhập hàng Kiếm steak',
        NULL,
        get_or_create_partner('CT TRƯỜNG THẢO - PY (TRƯỜNG)', CASE WHEN 'INTERNAL_TRANSFER' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Nợ NCC'),
        '20251001-036'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        5909400,
        'Vietart FB thanh toan công nợ chi phi mua 20.1kg ca co kiem saku',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('CT TNHH VIETART F&B', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TCB CTY'),
        '20251001-037'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        6350000,
        'Ngọc Anh đà nẵng thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MS NGỌC ANH- ĐÀ NẴNG', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-038'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        6350000,
        'TT công nợ Nguyễn Thị Thu',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC NGUYỄN THỊ THU - PHÚ QUÝ', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-039'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        170,
        'Nhận 1 thùng nhum khay Đặng lý sơn gửi bãi ông tư',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-040'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        345,
        'Mua 15 bao đá bi',
        get_or_create_txn_category('Chi phí Sản xuất chung', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-041'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        500,
        'Gửi 2 thùng cho Phương HN xe tài thắng',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-042'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        160,
        'Nhận 2 thùng kiếm steak Trường py gửi',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-043'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        350,
        'Gửi 3 thùng DPN + 1 thùng cho A Toàn đn',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-044'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        150,
        'Gửi 1 thùng cho Vạn Quang Vĩnh Long',
        get_or_create_txn_category('Vận chuyển', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-045'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        150,
        'Nhận 1 thùng bạch tuộc a Tới phú Quý gửi xe Hà Linh',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('Khác', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('Tiền mặt'),
        '20251001-046'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        1890000,
        'Anh Lee Minh Heo thanh toán công nợ',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('MR LEE MINH HEO - HN', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-047'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        1890000,
        'TT công nợ Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-048'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'INCOME',
        '2025-01-09 23:54:00',
        23382000,
        'Sushi O Ba thanh toán công nợ hết tháng 9',
        get_or_create_txn_category('Doanh thu Bán hàng', 'INCOME'),
        get_or_create_partner('SUSHI O BA', CASE WHEN 'INCOME' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-049'
    ) ON CONFLICT (code) DO NOTHING;
    

    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        'EXPENSE',
        '2025-01-09 23:54:00',
        23382000,
        'TT công nợ Bé Tân',
        get_or_create_txn_category('Chi phí nguyên vật liệu', 'EXPENSE'),
        get_or_create_partner('NCC BÉ TÂN - VĨNH LƯƠNG', CASE WHEN 'EXPENSE' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account('TK Bé Tân'),
        '20251001-050'
    ) ON CONFLICT (code) DO NOTHING;
    