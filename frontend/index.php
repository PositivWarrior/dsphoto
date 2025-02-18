<?php
header("Access-Control-Allow-Origin: https://api.fotods.no");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Credentials: true");

$request_uri = $_SERVER['REQUEST_URI'];
if (!file_exists(__DIR__ . $request_uri) && !strpos($request_uri, '.')) {
    include __DIR__ . '/index.html';
} else {
    return false;
}
?> 