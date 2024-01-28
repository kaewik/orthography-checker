# Orthography Checker

## What does it do?

The Orthography Checker is a simple command line programm that corrects the orthography of some given text in German.
It is important to note that it currently only supports the German language.

## How does it work?

Using the node.js stream api it read the text sentence by sentence and buffers them. Then it sends them as requests to open ai.
I'm using here the `gpt-3.5-turbo` model with a temprature of `0.0`.
The model is asked to correct the sentences. With this correction I can then print the differences on the screen.

## Install

`yarn install --frozen-lockfile`

## Build

`yarn run tsc`

## Run

`yarn start -f <path to a file with text to check> --open-ai-key=<your open ai api token>`
