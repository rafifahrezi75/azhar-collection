<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (! $request->is('api/*') && in_array($response->getStatusCode(), [404, 403, 500, 503])) {
                return Inertia::render('Error', [
                    'status' => $response->getStatusCode(),
                    'message' => match ($response->getStatusCode()) {
                        404 => 'Halaman atau rute yang Anda tuju tidak ditemukan.',
                        403 => 'Anda tidak memiliki izin untuk mengakses halaman ini.',
                        500 => 'Terjadi kesalahan pada server.',
                        503 => 'Layanan sedang dalam pemeliharaan.',
                        default => 'Terjadi kesalahan.',
                    },
                ])->toResponse($request)->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
