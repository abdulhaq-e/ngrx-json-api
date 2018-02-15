import { ResourceDefinition } from '../src/interfaces';

export const resourceDefinitions = [
  {
    type: 'Article',
    collectionPath: 'articles',
    attributes: {
      body: {},
      text: {},
      title: {},
    },
    relationships: {
      author: {
        type: 'Person',
        relationType: 'hasOne',
      },
      comments: {
        type: 'Comment',
        relationType: 'hasMany',
      },
      blog: {
        type: 'Blog',
        relationType: 'hasOne',
      },
    },
  },
  {
    type: 'Person',
    collectionPath: 'people',
    attributes: {
      firstName: {},
      name: {},
    },
    relationships: {
      profile: {
        type: 'Profile',
        relationType: 'hasOne',
      },
    },
  },
  {
    type: 'Comment',
    collectionPath: 'comments',
  },
  {
    type: 'Profile',
    collectionPath: 'profiles',
    attributes: {
      id: {},
    },
  },
  {
    type: 'Blog',
    collectionPAth: 'blogs',
    attributes: {
      name: {},
    },
  },
  {
    type: 'Post',
    collectionPath: 'posts',
  },
];

export const documentPayload = {
  data: [
    {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'JSON API paints my bikeshed!',
      },
    },
    {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Untitled',
      },
    },
  ],
  included: [
    {
      type: 'Person',
      id: '1',
      attributes: {
        name: 'Person 1',
      },
    },
    {
      type: 'Person',
      id: '2',
      attributes: {
        name: 'Person 2',
      },
    },
  ],
};

export const testPayload = {
  links: {
    someLink: 'someLinkValue',
  },
  meta: {
    someMeta: 'someMetaValue',
  },
  data: [
    {
      type: 'Article',
      id: '1',
      attributes: {
        title: 'Article 1',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '1' },
        },
        comments: {
          data: [{ type: 'Comment', id: '1' }],
        },
      },
    },
    {
      type: 'Article',
      id: '2',
      attributes: {
        title: 'Article 2',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '22' },
        },
        comments: {
          data: [],
        },
      },
    },
    {
      type: 'Person',
      id: '1',
      attributes: {
        name: 'Person 1',
      },
      relationships: {
        blogs: {
          data: [{ type: 'Blog', id: '1' }, { type: 'Blog', id: '3' }],
        },
        profile: {
          data: { type: 'Profile', id: '1' },
        },
      },
    },
    {
      type: 'Person',
      id: '2',
      attributes: {
        name: 'Person 2',
      },
    },
    {
      type: 'Comment',
      id: '1',
      attributes: {
        text: 'Uncommented',
      },
    },
    {
      type: 'Comment',
      id: '2',
      attributes: {
        text: 'No comment',
      },
    },
    {
      type: 'Blog',
      id: '1',
      attributes: {
        name: 'Blog 1',
      },
      relationships: {
        author: {
          data: { type: 'Person', id: '2' },
        },
      },
    },
    {
      type: 'Blog',
      id: '2',
    },
    {
      type: 'Blog',
      id: '3',
      relationships: {
        author: {
          data: { type: 'Person', id: '1' },
        },
      },
    },
    {
      type: 'Profile',
      id: '1',
    },
    {
      type: 'Whatever',
      id: '1',
    },
  ],
};
