<?php

namespace App\Console\Commands;

use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;

class UpdateSensitiveWords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:sensitiveWords {json}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Sensitive Words Library';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        Setting::store(
            Setting::KEY_SENSITIVE_WORDS_LIB,
            Crypt::encryptString($this->argument('json')),
        );
    }
}
