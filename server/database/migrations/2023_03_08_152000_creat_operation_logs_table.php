<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('operation_logs', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('project_start_up_id')->nullable();
            $table->bigInteger('middle_examination_id')->nullable();
            $table->bigInteger('final_examination_id')->nullable();
            $table->bigInteger('user_id');
//            $table->string('type')->comment('是项目立项日志还是中期检测日志等等');
            $table->string('status')->comment('状态快照');
            $table->string('content')->comment('结果');
            $table->timestamps();
        });
        Schema::table('operation_logs', function (Blueprint $table) {
            $table->index('project_start_up_id');
            $table->index('middle_examination_id');
            $table->index('final_examination_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('operation_logs');
    }
};
