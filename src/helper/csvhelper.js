import _ from "lodash";

export const bulkUpsert = async (Model, data, filterFields) => {
    if (_.isEmpty(data)) return;

    await Model.bulkWrite(
        _.map(data, (item) => ({
            updateOne: {
                filter: _.pick(item, filterFields),
                update: {
                    $set: item,
                },
                upsert: true,
            },
        }))
    );
};