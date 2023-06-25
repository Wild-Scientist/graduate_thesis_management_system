<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin Builder
 */
class VerificationCode extends Model
{
    use HasFactory;

    public static function generateCode($phone, $type): int
    {
        $code = rand(1000, 9999);
        $record = (new VerificationCode)
            ->where('phone', $phone)
            ->where('type', $type)
            ->first();
        if (!$record) {
            $record = new VerificationCode();
            $record->{'phone'} = $phone;
            $record->{'type'} = $type;
        }
        $record->code = $code;
        $record->save();
        return $code;
    }

    public static function verifyCode($phone, $type, $code): array
    {
        $record = (new VerificationCode)
            ->where('phone', $phone)
            ->where('type', $type)
            ->first();

        if (!$record || $record->{'code'} !== (string)$code) {
            return [false, '验证码不正确'];
        }

        $updatedAt = new Carbon($record->updated_at);
        $now = new Carbon();
        if ($now->greaterThan($updatedAt->addMinutes(5))) {
            return [false, '验证码过期'];
        }

        $record->code = 0;
        $record->save();
        return [true, null];
    }
}
