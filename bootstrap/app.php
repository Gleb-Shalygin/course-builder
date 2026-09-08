<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
//        RateLimiter::for('api', function (Request $request) {
//            return Limit::perMinute(60)->by(
//                $request->user()?->id ?? $request->ip()
//            );
//        });

        $middleware->web(append: [
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Маршруты api.php сами подключают группу web (сессия + CSRF),
        // поэтому EnsureFrontendRequestsAreStateful здесь не нужен:
        // вместе с web он запускал StartSession дважды и сессия жила один запрос.
        $middleware->api([
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
