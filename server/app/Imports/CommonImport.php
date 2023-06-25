<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\Importable;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class CommonImport
{
    use Importable;

    const TEMPLATE_INVALID_MESSAGE = '上传文件表头错误，请重新下载模板';

    /**
     * 在行数据中根据表头名称获取值
     *
     * @param $row
     * @param $name
     * @param $head
     * @return string
     */
    public static function getValueFromRowByName($row, $name, $head): string
    {
        return self::filter($row[array_search($name, $head)]);
    }

    /**
     * 过滤掉除数字、英文、中文之外的任何字符（此方法可根据导入需求定制）
     *
     * @param $str
     * @return string
     */
    public static function filter($str): string
    {
        return preg_replace('/[^0-9a-zA-Z\x{4e00}-\x{9fa5}]/u', '', $str);
    }

    /**
     * 处理读取到的日期（以字符串方式读取 Excel 中的日期，读出来有可能是数字，也有可能是字符串，取决于单元格格式，通过此函数统一为字符串）
     *
     * @param $date
     * @return mixed
     */
    public static function readDateAuto($date): mixed
    {
        return is_numeric($date) ? Date::excelToDateTimeObject($date)->format('Y-m-d') : $date;
    }
}
