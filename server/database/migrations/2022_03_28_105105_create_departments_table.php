<?php

use App\Models\Department;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('parent_id')->index()->comment('父级ID');
            $table->string('id_link')->nullable()->comment('从根到当前节点的ID链');
            $table->boolean('is_leaf')->index()->default(true)->comment('是否是叶子节点');
            $table->string('name')->comment('名称');
            $table->timestamps();
            $table->softDeletes();
        });
        // 创建一个根部门
        $d = new Department();
        $d->{'parent_id'} = 0;
        $d->{'name'} = '';
        $d->save();
        $d->{'id_link'} = '/' . $d->{'id'} . '/';
        $d->save();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('departments');
    }
};
