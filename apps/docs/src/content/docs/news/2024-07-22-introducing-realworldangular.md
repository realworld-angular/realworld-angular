---
title: Announcing RealWorld Angular
date: 2024-07-22
excerpt: "I’m thrilled to announce a new open-source project, RealWorld Angular, a spin-off of the RealWorld project that focuses on providing comprehensive example apps and showcasing Angular libraries to offer a more realistic environment for demonstrating technical aspects and best practices in Angular development."
authors:
  name: Gerome Grignon
  title: RealWorld Angular creator
  picture: https://avatars.githubusercontent.com/u/32737308?v=4
  url: https://gerome.dev
---

I'm pretty excited to announce this new open-source project!

I've been maintaining RealWorld project for 3 years and decided to create a spin-off to focus on Angular.


## Once upon a time... RealWorld

[RealWorld](https://github.com/gothinkster/realworld) is an open source project created by [Albert Pai](https://x.com/iamalbertpai) and [Eric Simons](https://x.com/ericsimons40) back in 2016.
You can find their announcement [here](https://medium.com/@ericsimons/introducing-realworld-6016654d36b5).

In a nutshell, it aims to provide examples apps built with different frameworks but still adhering to the same API spec.
If you know [TodoMVC](https://todomvc.com/), RealWorld is quite about the same philosophy but with more complete examples.

At the time of writing, RealWorld is close to 80k GitHub Stars and include 204 example apps listed [here](https://codebase.show/projects/realworld).

## What is RealWorld Angular compared to RealWorld

This new project is a spin-off focusing on Angular.
As RealWorld is about comparing frameworks with a limited list of example apps for each of them (for maintainability reasons), this new project aims to do quite about the same but by showcasing Angular libraries.

### Why a spin-off

As a Angular Discord server moderator, questions about recommended example apps are quite common.
But in most situations, examples are limited StackBlitz projects or small demos by Angular libraries maintainers.

The goal is both to provide a more **Real world** situation to showcase technical aspects or libraries integration in an Angular project and to build a great playground with example apps you can test, customize or update.

### Angular app template

RealWorld Angular will provide a demo application and API spec.
But it'll be a new more complete application to open opportunities to enhance it with examples apps :

- what about adding i18n ?
- what about using a state management library ?
- what about choosing template driven forms over Reactive Forms ?
- what about using SSR over CSR ?
- and so on...

Unlike RealWorld requiring most example apps to start from scratch with a new framework, a GitHub starter template will be provided to focus on details.

RealWorld provided a blogging platform as a demo. RealWorld Angular will provide an event platform demo, with way more situations to showcase Angular features and modern best practices used in web applications.

### Where is the template ?

This project is built in public and this template is still WIP: the first current step is the creation of the API, built with Nitro.

### Community

By focusing on a framework and providing an app template, it'll be easier with this project to engage with the community and create open-source contributions opportunities.
Based on the template, Examples apps will be created on demand in the [GitHub organization](https://github.com/realworld-angular), providing Maintainer role to anyone willing to help by contributing to a new example app: Trust by design!

Discover a more complete introduction about RealWorld Angular on the [GitHub organization](https://github.com/realworld-angular).
