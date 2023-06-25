<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 创建一个超管
        $u = new User();
        $u->name = '超管';
        $u->is_dev = true;
        $u->save();
        $u->roles()->sync([Role::ROLE_ID_SUPER]);

        // 创建一个用户
        $u = new User();
        $u->name = '用户';
        $u->save();
        $u->roles()->sync([Role::ROLE_ID_USER]);
    }
}
