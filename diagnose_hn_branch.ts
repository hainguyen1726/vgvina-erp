/**
 * Script diagnose: Tại sao nhân viên HN không thấy dữ liệu?
 * Chạy trực tiếp trong dapps/services hoặc qua SQL trực tiếp
 */

import { supabase } from './src/supabaseClient';

export async function diagnoseBranchIssue(email?: string) {
  console.log('🔍 DIAGNOSING HN BRANCH DATA VISIBILITY ISSUE...\n');

  // 1. List all facilities
  console.log('📍 STEP 1: All Facilities in System');
  const { data: facilities, error: facErr } = await supabase
    .from('vgvina_facilities')
    .select('*');
  if (facErr) console.error('ERROR:', facErr);
  console.table(facilities);

  // 2. Check HN specific facility
  console.log('\n📍 STEP 2: Facility named "HN" or contains "Hà Nội"');
  const { data: hnFac } = await supabase
    .from('vgvina_facilities')
    .select('*')
    .or(`name.ilike.%HN%,name.ilike.%Hà Nội%`);
  console.table(hnFac);

  // 3. List all users with their assigned facilities
  console.log('\n📍 STEP 3: All Users + Assigned Facilities');
  const { data: users, error: userErr } = await supabase
    .from('vgvina_users')
    .select(`
      id,
      full_name,
      email,
      phone_number,
      role,
      facilities:vgvina_user_facilities (
        is_primary,
        facility_id,
        facility:vgvina_facilities (id, name)
      )
    `);
  if (userErr) console.error('ERROR:', userErr);
  console.table(users?.map(u => ({
    name: u.full_name,
    email: u.email,
    role: u.role,
    assigned_facilities: (u.facilities as any[])?.map(f => f.facility?.name).join(', ') || 'NONE',
    primary_facility: (u.facilities as any[])?.find(f => f.is_primary)?.facility?.name || 'NOT SET'
  })) || []);

  // 4. If email provided, deep dive on that user
  if (email) {
    console.log(`\n📍 STEP 4: Deep Dive on ${email}`);
    const { data: userDetail } = await supabase
      .from('vgvina_users')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        role,
        role_id,
        is_admin,
        role_details:role_id (
          id,
          name,
          display_name,
          is_admin
        ),
        facilities:vgvina_user_facilities (
          id,
          is_primary,
          facility_id,
          facility:vgvina_facilities (id, name)
        )
      `)
      .eq('email', email)
      .maybeSingle();
    console.log('User Record:', userDetail);

    if (userDetail) {
      const primaryFac = (userDetail.facilities as any[])?.find(f => f.is_primary);
      console.log('\n✓ Primary Facility:', primaryFac?.facility?.name || 'NOT SET');
      console.log('✓ Facilities Assigned:', (userDetail.facilities as any[])?.length || 0);
      console.log('✓ Is Admin:', userDetail.is_admin || (userDetail.role_details as any)?.is_admin);

      // 5. Check inventory data for user's facility
      if (primaryFac?.facility_id) {
        console.log(`\n📍 STEP 5: Inventory at ${primaryFac.facility?.name}`);
        const { data: inv } = await supabase
          .from('vgvina_inventory')
          .select('*')
          .eq('facility_id', primaryFac.facility_id)
          .limit(5);
        console.table(inv);

        // 6. Check sales orders at that facility
        console.log(`\n📍 STEP 6: Recent Sales Orders at ${primaryFac.facility?.name}`);
        const { data: sales } = await supabase
          .from('vgvina_sales_orders')
          .select('id, facility_id, order_date, total_amount')
          .eq('facility_id', primaryFac.facility_id)
          .order('order_date', { ascending: false })
          .limit(5);
        console.table(sales);
      }
    }
  }

  console.log('\n✅ DIAGNOSIS COMPLETE');
  console.log('🔧 POTENTIAL ISSUES:');
  console.log('  1. User not assigned to HN facility in vgvina_user_facilities?');
  console.log('  2. Primary facility (is_primary = true) not set?');
  console.log('  3. HN facility name changed (check exact name match)?');
  console.log('  4. Inventory table empty for HN facility?');
}

// Run if called directly
if (typeof window === 'undefined') {
  (async () => {
    const email = process.argv[2] || 'test@example.com';
    await diagnoseBranchIssue(email);
  })();
}
