import { Post } from "../models";


/*  ====================
 *  -- Tags Service --
 *  ====================
 */

export class TagsService {

    /**
     * This function is responsible for showing tags only for auto complete in text input
     * @param groupId 
     * @param query 
     */
    createTagsListQuery(groupId: any, query: any) {

        // process the user data records and return computed result
        return Post.aggregate([{

            /**
             * Match all the posts with the following conditions in the database:
             * 1. Query matching any posts exists in the post model
             * 2. Any post having the same group in which current user is in
             */
            $match: {
                $and: [
                    { tags: { $regex: new RegExp(query, 'i') } },
                    // { _group: groupId }
                ]
            }
        },
        { $unwind: "$tags" },
        {
            $match: {
                $and: [
                    { tags: { $regex: new RegExp(query, 'i') } },
                    // { _group: groupId }
                ]
            }
        },
        {
            $project: {
                tags: '$tags'
            }
        }
        ])
    }

    /**
     * This function is responsible for generating the tags search result set
     * @param groupId
     * @param tag
     * */
    async getTagsSearchResults(groupId: any, tag: any) {

        try {

            // Convert the query into regex 
            let regexConvert = tag.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')

            // Create the tags query and start aggregating the results & Execute the query and limit the result to 10
            let tags: any = await this.createTagsListQuery(groupId, regexConvert)
                .skip(0)
                .limit(10)
                .exec() || [];

            // Filter the tags and remove the duplicates if any
            if (tags) {
                let key = ["tags"],
                    filtered = tags.filter(
                        (tag => (o: any) =>
                            (k => !tag.has(k) && tag.add(k))
                                (key.map(k => o[k]).join('|'))
                        )
                            (new Set)
                    );

                // Update the tags array to the new filtered array
                tags = filtered

                // Return tags
                return tags
            }
        } catch (err) {
            return err;
        }
    };

}