-- =============================================================================
-- BACKFILL: gán is_primary = TRUE cho row đầu tiên của mỗi user
-- bị thiếu primary facility (nguyên nhân login thấy "Chưa gán")
-- =============================================================================
-- Áp dụng cho:
--   - id=12 trang.vgvina@gmail.com (3 facilities, 0 primary)
--   - id=23 Test_HN@vgvina.com    (3 facilities, 0 primary)
--   - và bất kỳ user nào khác đang ở trạng thái tương tự
-- =============================================================================

WITH first_per_user AS (
    SELECT DISTINCT ON (uf.user_id)
        uf.id AS uf_id,
        uf.user_id
    FROM public.vgvina_user_facilities uf
    WHERE NOT EXISTS (
        SELECT 1 FROM public.vgvina_user_facilities x
        WHERE x.user_id = uf.user_id AND x.is_primary = TRUE
    )
    ORDER BY uf.user_id, uf.created_at, uf.id  -- ưu tiên row sớm nhất
)
UPDATE public.vgvina_user_facilities uf
SET is_primary = TRUE
FROM first_per_user f
WHERE uf.id = f.uf_id
RETURNING uf.user_id, uf.facility_id, uf.is_primary;

-- Verify: phải về 0 row sau khi chạy backfill
SELECT
    u.id,
    u.email,
    u.full_name,
    COUNT(uf.id) FILTER (WHERE uf.is_primary) AS primary_count,
    COUNT(uf.id) AS total_assigned
FROM public.vgvina_users u
LEFT JOIN public.vgvina_user_facilities uf ON uf.user_id = u.id
GROUP BY u.id, u.email, u.full_name
HAVING COUNT(uf.id) > 0 AND COUNT(uf.id) FILTER (WHERE uf.is_primary) = 0;
