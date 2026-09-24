<?php

namespace App\Enums;

enum RunnerStage: string
{
    case Intro = 'intro';
    case Question = 'question';
    case Finish = 'finish';
    case Result = 'result';
}
