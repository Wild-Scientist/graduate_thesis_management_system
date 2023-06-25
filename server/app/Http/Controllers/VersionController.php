<?php

namespace App\Http\Controllers;

use App\Constants;
use App\Models\Version;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VersionController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $validator = validator($request->all(), [
            'page' => Constants::VALIDATOR_PAGE,
            'page_size' => Constants::VALIDATOR_PAGE_SIZE,
            'created_at' => Constants::VALIDATOR_ORDER,
            'updated_at' => Constants::VALIDATOR_ORDER,
            'keyword' => 'string|nullable',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $versions = Version::query();
        if ($request->has('keyword')) {
            $keyword = $request->{'keyword'};
            $versions = $versions->where('version', 'like', "%$keyword%");
        }
        if ($request->has('created_at')) {
            $versions = $versions->orderBy('created_at', $request->{'created_at'});
        } else {
            $versions = $versions->orderBy('created_at', 'desc');
        }
        if ($request->has('updated_at')) {
            $versions = $versions->orderBy('updated_at', $request->{'updated_at'});
        }
        $versions = $versions->paginate($request->page_size ?? Constants::DEFAULT_PAGE_SIZE);
        foreach ($versions as $version) {
            $version->{'abstract'} = Str::limit(strip_tags($version->{'content'}), 30);
        }
        return successResponse($versions);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'id' => 'numeric|exists:versions,id',
            'version' => 'string|required',
            'content' => 'string|required',
        ]);
        if ($validator->fails()) {
            return errorResponse($validator->errors()->first(), null, 400);
        }
        $version = $request->{'id'} ? (new Version)->find($request->{'id'}) : new Version();
        if (!$request->{'id'}) {
            if ((new Version())->where('version', $request->{'version'})->first()) {
                return errorResponse('版本号已存在');
            }
        }
        $version->{'version'} = $request->{'version'};
        $version->{'content'} = $request->{'content'};
        $version->save();
        return successResponse();
    }

    public function latestVersion(): JsonResponse
    {
        return successResponse((new Version)->orderBy('created_at', 'desc')->first());
    }
}
