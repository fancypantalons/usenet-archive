# My Usenet Archive

## Summary

This project is an experiment in using JSON as a data archive format, with HTML and Javascript as a method of rich front-end visualization.  The theory is that HTML+JS+JSON may make for an effective method for delivering self-contained data payloads with a visualizer, stored in a format that is durable and future-proof simply by being plain text.

## Background - Scraping Google Groups

It turns out Google Groups is sitting on a pretty extensive archive of old Usenet posts, some of which I’ve written, all of which date back to as early as ‘93. I wanted to archive those posts for myself, but discovered Groups provides no mechanism or API for pulling bulk content from their archive.

For shame!

Fortunately, Puppeteer made this a pretty easy nut to crack, such that it was just challenging enough to be fun, but easy enough to be done in a day. And thus I had the perfect one-day project during my holiday!

My Google Groups web scraping exercise left me with an archive of over 3000 messages, of which 400 were written by yours truly. These messages were laid down in a set of files, each containing JSON payloads of messages and associated metadata.

But… what do I do with it now?

Obviously the goal is to be able to explore the messages easily, but that requires a user interface of some kind.

## A Basic Frontend

The obvious user interface for a large blob of JSON-encoded data is, of course, HTML, and so started my next mini-project.

First, I took the individual message group files and concatenated them into a single large JSON structure containing all the messages. Total file size: 4.88MB.

Next, I created an empty shell HTML file, loaded in the JSON data, and then wrote some code to walk through the messages and build up a DOM representation that I could format with CSS. The result is simple but effective! Feel free to take a look at my Usenet Archive here. But be warned, a lot of this is stuff I posted when I was as young as 14 years old…

Usage is explained in the page, so hopefully it should be pretty self-explanatory.

