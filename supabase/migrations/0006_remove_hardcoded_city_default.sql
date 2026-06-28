-- =====================================================
-- 移除硬编码的城市默认值"南昌"
-- =====================================================

-- 修改 profiles 表，移除城市默认值
ALTER TABLE profiles 
  ALTER COLUMN city DROP DEFAULT;

-- 修改 companies 表，移除城市默认值
ALTER TABLE companies 
  ALTER COLUMN city DROP DEFAULT;

-- 将现有值为"南昌"但可能是默认值的记录重置为 NULL（可选，视需求而定）
-- 这里不做批量修改，避免影响真实数据
