<?php

if (isset($_SERVER['HTTP_REFERER']) && isset($_SERVER['HTTP_HOST'])) {
    // check http-referor before doing this GET request
    
    $p_url = parse_url($_SERVER['HTTP_REFERER']);
    if ($p_url['host'] != $_SERVER['HTTP_HOST']) {
        header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
        header('Content-Type: text/plain;charset=utf-8');
        die('error: bad http referer');
    }
}

session_start();
unset($_SESSION['user']); 
header('Location: /');
