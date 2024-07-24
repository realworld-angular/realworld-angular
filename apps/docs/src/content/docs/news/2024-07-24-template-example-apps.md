---
title: "Template, Example apps and API"
date: 2024-07-24
excerpt: "Understand the building blocks of the RealWorld Angular project: the template example apps and the API."
authors:
  name: Gerome Grignon
  title: RealWorld Angular creator
  picture: https://avatars.githubusercontent.com/u/32737308?v=4
  url: https://gerome.dev
---

# Introduction to the RealWorld Angular Project

The **RealWorld Angular** project consists of three main components:

1. **The Template**
2. **Example Apps**
3. **API**

## The Template

The RealWorld Angular template is an Angular Client-Side Rendering (CSR) application designed as a starting point for example apps. It demonstrates an event platform similar to solutions like *Eventbrite* or *Meetup*.

This template is an excellent playground for showcasing technical aspects and best practices in Angular development:

- **Manage Communities**: Create accounts, join groups, and follow users.
- **Membership**: Role-based access control.
- **Surveys**: Dynamic forms with drag-and-drop functionality.
- **Community Locations**: Maps integration.
- **Events**: Create, edit, and delete events.
- **Event Registration**: RSVP, check-in, and feedback.
- **Event Management**: Schedule, speakers, sponsors, and attendees.
- **Event Promotion**: Social sharing and SEO.
- **Event Discovery**: Search, filters, and recommendations.
- **Event Participation**: Chat, live polls, and Q&A.
- **Event Feedback**: Ratings, reviews, and reports.

Unlike simple CRUD applications or a collection of small project ideas (like a to-do list or weather app), the RealWorld Angular template is a simple complex application that serves as a reference for real-world scenarios. It addresses challenges such as architecture, performance, and migration costs that cannot be effectively covered by simpler applications.

However, the goal is not to create an overly complex application that includes NgRX, NGXS, and all existing UI frameworks in one Angular app. This is where example apps come into play.

## Example Apps

Example apps are a collection of applications that use the RealWorld Angular template as a foundation. These examples explore different configurations and features, such as:

- Using **NgRX** instead of Angular services for state management.
- Implementing **Angular Material** instead of custom Angular presentational components.
- Adopting **Tailwind CSS** instead of custom CSS.

Additionally, example apps showcase more advanced features in isolated examples, including:

- Server-Side Rendering (SSR) support.
- Internationalization (i18n).
- Progressive Web App (PWA) capabilities.
- Integration with Storybook.

## API

Unlike most demo projects that use mock data, the RealWorld Angular project includes a real API. This API is used by the template and example apps to interact with a real backend, providing a more authentic and practical experience.
