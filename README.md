# web-archive

See it in action on https://archive.selcukcihan.com

This is an app that I use to save any web pages, articles etc. that I think is or would be useful.
I can't read all the articles right away as I stumble upon them, so this app serves as an online library for myself.

* The app uses openai to summarize and tag articles.
* The app fetches metadata of the page and extracts opengraph data to provide a preview of the page including its title.
* Summarization and tagging happen asynchronously, whereas opengraph data extraction is immediate.

## UI

UI is created with vercel v0 using the following initial command:

```
Create an app that will display links I've stumbled upon and decided to save.
For each web page, it should show a small preview, title and related tags.
When you hover over the web page, it should display a summary of the web page.
The app should list all the web pages ordered by date of creation.
The app should let me filter web pages by tag and also let me see and search through tags while filtering.
The app should let me add a new web page by providing its link.
```

## Data

* Web page data is stored in DynamoDB.
* Image thumbnails shown for each link are stored in S3.

### Model

`WebPage`
  - id
  - url
  - originalUrl
  - title
  - summary
  - dateAdded
  - tags (list of tag IDs)

`Tag`
  - id
  - name

### Access Patterns

#### Get Web Page By ID

Most basic use case, given an ID of `WebPage` fetch the corresponding record.

We won't need this right away, I think the listing api is just enough for now.

#### List & Filter Web Pages

* You can list all the web pages, sorted by date of addition.
* You can also filter on tags, so you can ask for `all web pages that are tagged "cloud computing"`, again sorted by date of addition.

To serve these queries, we'll need an index of web pages with the following info for each entry:

1. WebPage ID
2. List of tag IDs

sorted by date of addition.

#### List Tags

We need to show a list of tags to choose from, when listing web pages.

## Architecture

The UI and server side nextjs app are hosted on vercel.

NextJS backend accesses directly to DynamoDB & S3.

### Data Ingestion & Processing

There's a script that iterates through DynamoDB and summarizes/tags links that are not yet processed.
The script also uploads thumbnail images to S3.

There's another script that inserts a new link to DynamoDB.

These scripts are not automated yet, I run them as I bump into articles I want to save for later.
