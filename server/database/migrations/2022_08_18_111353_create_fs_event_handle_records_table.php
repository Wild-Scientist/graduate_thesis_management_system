<?php

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
        Schema::create('fs_event_handle_records', function (Blueprint $table) {
            $table->id();
            $table->longText('post_data')->fulltext()->nullable()->comment('收到的 POST 数据');
            $table->string('event_id')->index()->nullable()->comment('事件的唯一标识');
            $table->string('event_type')->index()->nullable()->comment('事件类型');
            $table->dateTime('send_time')->index()->nullable()->comment('事件发送时间');
            $table->longText('info')->fulltext()->nullable()->comment('事件处理过程中的信息');
            $table->longText('exception')->fulltext()->nullable()->comment('事件处理过程中的异常');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fs_event_handle_records');
    }
};
